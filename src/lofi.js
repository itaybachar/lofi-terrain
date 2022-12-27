let canvas = undefined;
let ctx = undefined;
let frameRefresh = undefined;
const PI = Math.PI;

const reachWidth = 100;
const reachHeight = 70;

let width = 150;
let height = 70;
let rows = 0, cols = 0;

let K1 = 300;
let K2 = -3;

let flying = 0, flyingDelta = 0.02;
let horizontalOffset = 0;

let terrainAngle = 0;

let translateX = 0, translateY = 0;
let t_angle_sin = 0, t_angle_cos = 0;

function initCanvas()
{
    canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if (!canvas.getContext)
        return;

    translateX = canvas.width / 2;
    translateY = canvas.height * 1.2;
    ctx = canvas.getContext('2d');
    var grad = ctx.createLinearGradient(canvas.width / 2, canvas.height, canvas.width / 2, canvas.height / 3);
    grad.addColorStop(0.3, "#ffbf15");
    grad.addColorStop(0.5, "#C91853")
    grad.addColorStop(1, "#301D7D");
    ctx.strokeStyle = grad;

    terrainAngle = calculateStartAngle();
}

function startMovement()
{
    if (!frameRefresh)
        frameRefresh = setInterval(drawTerrain, 50)
}

function stopMovement()
{
    if (frameRefresh)
    {
        clearInterval(frameRefresh);
        frameRefresh = undefined;
    }

}

function drawTerrain()
{
    if (frameRefresh)
        flying += 0.03;
    clearFrame();
    // ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.fillStyle = 'rgba(0,0,0,0.7)'

    let heightRange = 5;
    let maxHeight = 0;
    let minHeight = 14;

    //create grid
    ctx.beginPath();

    let yoff = flying;
    for (let y = 0; y < height; y++)
    {
        let xoff = horizontalOffset;
        for (let x = 0; x < width; x++)
        {
            let point0 = { x: -width * 0.5 + x, y: y, z: map(noise(xoff, yoff), minHeight, maxHeight) };
            let point1 = { x: -width * 0.5 + x + 1, y: y, z: map(noise(xoff + 0.03, yoff), minHeight, maxHeight) };
            let point2 = { x: -width * 0.5 + x, y: y - 1, z: map(noise(xoff, yoff - 0.05), minHeight, maxHeight) };
            let point3 = { x: -width * 0.5 + x + 1, y: y - 1, z: map(noise(xoff + 0.03, yoff - 0.05), minHeight, maxHeight) };

            point0 = rotatePoint(point0, terrainAngle);
            point1 = rotatePoint(point1, terrainAngle);
            point2 = rotatePoint(point2, terrainAngle);
            point3 = rotatePoint(point3, terrainAngle);

            let p0oz = 1 / point0.z;
            let p1oz = 1 / point1.z;
            let p2oz = 1 / point2.z;
            let p3oz = 1 / point3.z;

            point0 = { x: K1 * point0.x / point0.z, y: K1 * point0.y * p0oz, z: point0.z };
            point1 = { x: K1 * point1.x / point1.z, y: K1 * point1.y * p1oz, z: point1.z };
            point2 = { x: K1 * point2.x / point2.z, y: K1 * point2.y * p2oz, z: point2.z };
            point3 = { x: K1 * point3.x / point3.z, y: K1 * point3.y * p3oz, z: point3.z };

            drawPoints(point0, point1, point2, point3, xoff, yoff);

            xoff += 0.03;
        }
        yoff += 0.05;
    }
    ctx.closePath();
    ctx.stroke();
    // ctx.fill();
}

function drawPoints(p0, p1, p2, p3)
{
    p0 = { x: translateX + p0.x, y: translateY - p0.y };
    p1 = { x: translateX + p1.x, y: translateY - p1.y };
    p2 = { x: translateX + p2.x, y: translateY - p2.y };
    p3 = { x: translateX + p3.x, y: translateY - p3.y };

    if (p0.x > 0 && p0.x < canvas.width && p0.y > 0 && p0.y < canvas.height ||
        p1.x > 0 && p1.x < canvas.width && p1.y > 0 && p1.y < canvas.height ||
        p2.x > 0 && p2.x < canvas.width && p2.y > 0 && p2.y < canvas.height)
    {
        ctx.moveTo(p1.x, p1.y);

        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);

        // ctx.moveTo(p1.x + 2, p1.y);
        // ctx.lineTo(p2.x + 2, p2.y);
        // ctx.lineTo(p3.x + 2, p3.y);
        // ctx.lineTo(p1.x + 2, p1.y);
    }
}

function rotatePoint(point, theta)
{
    let z = K2 + point.z * t_angle_cos - point.y * t_angle_sin;
    if (z == 0)
        z += 0.01;
    return {
        x: point.x,
        y: point.y * t_angle_cos + point.z * t_angle_sin,
        z: z
    }
}

function clearFrame()
{
    //set background
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function map(x, a, b)
{
    return a + x * (b - a);
}

window.addEventListener("resize", function (e)
{
    initCanvas();
    return false;
}, true);


let keysPressed = {};

addEventListener('keydown', (event) =>
{
    keysPressed[event.code] = true;
});

addEventListener('keyup', (event) =>
{
    delete keysPressed[event.code];
});

let movingForward = false, movingSide = false;
addEventListener('keydown', async (e) =>
{
    //Space Bar
    if (keysPressed['Space'])
    {
        if (frameRefresh)
        {
            clearInterval(frameRefresh);
            frameRefresh = undefined;
            document.getElementById("background").classList.remove("moving")

        } else 
        {
            document.getElementById("background").classList.add("moving")
            frameRefresh = setInterval(drawTerrain, 50)
        }
    }
});


function clipVal(x, min, max)
{
    // return x;
    return (x > max) ? max : (x < min) ? min : x;
}

function calculateStartAngle()
{
    //Idea here is to take 2 data points, the angle and window height. The angle is chosen by me
    //to look good, So i find it with a large height, and smaller height. From there I can
    //calculate the angle based on those proportions and the current screen height.

    //Here height is x, angle is y
    //For vertical phone: angle: 95 deg, height: 896(is fine with horizontal monitors)
    //Horizontal Phone: angle: 48, height: 415
    //Slope: (95-48)/(896-415) = 0.09771309771(should be negative)
    //Finding B: 48+m*415 = B = 88.55

    //Realistically, we need to clip the angle between 60-150
    angle = 88.55 + window.innerHeight * -    0.09771309771; //angle in deg
    angle = -1 * clipVal(angle, 35, 150) * (PI / 180); //Need angle to be negative to show in our case
    t_angle_cos = Math.cos(angle);
    t_angle_sin = Math.sin(angle);
    return angle;

}