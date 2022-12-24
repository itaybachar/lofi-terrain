let canvas = undefined;
let ctx = undefined;
let frameRefresh = undefined;
const PI = Math.PI;

let width = 100;
let height = 50;
let rows = 0, cols = 0;

const K1 = 300;
const K2 = 10;

let flying = 0;

let terrainAngle = 0.7;

let translateX = 0, translateY = 0;

function initCanvas()
{
    canvas = document.getElementById('canvas');
    if (!canvas.getContext)
        return;

    translateX = canvas.width / 2; //K1 * (width / 2);
    translateY = canvas.height * 1.2;
    ctx = canvas.getContext('2d');
    var grad = ctx.createLinearGradient(canvas.width / 2, canvas.height, canvas.width / 2, canvas.height / 3);
    grad.addColorStop(0, "#ffbf15");
    grad.addColorStop(0.5, "#C91853")
    grad.addColorStop(1, "#301D7D");
    ctx.strokeStyle = grad;


    frameRefresh = setInterval(drawTerrain, 50)
    // drawTerrain();
}

function drawTerrain()
{
    flying += 0.03;
    clearFrame();
    // ctx.strokeStyle = 'rgba(255,255,255,1)'
    ctx.fillStyle = 'rgba(255,255,255,1)'

    //create grid
    ctx.beginPath();

    let yoff = flying;
    for (let y = 0; y < height; y++)
    {
        let xoff = 0;
        for (let x = 0; x < width; x++)
        {
            let point0 = { x: -width / 2 + x, y: y, z: 0 };
            let point1 = { x: -width / 2 + x + 1, y: y, z: 0 };
            let point2 = { x: -width / 2 + x, y: y - 1, z: 0 };

            point0 = rotatePoint(point0, terrainAngle);
            point1 = rotatePoint(point1, terrainAngle);
            point2 = rotatePoint(point2, terrainAngle);

            point0 = { x: K1 * point0.x / point0.z, y: K1 * point0.y / point0.z, z: point0.z };
            point1 = { x: K1 * point1.x / point1.z, y: K1 * point1.y / point1.z, z: point1.z };
            point2 = { x: K1 * point2.x / point2.z, y: K1 * point2.y / point2.z, z: point2.z };


            ctx.moveTo(translateX + point1.x, translateY - point1.y - 100 + noise(xoff + 0.01, yoff) * 200);

            ctx.lineTo(translateX + point2.x, translateY - point2.y + -100 + noise(xoff, yoff - 0.01) * 200);
            ctx.lineTo(translateX + point0.x, translateY - point0.y + -100 + noise(xoff, yoff) * 200);
            ctx.lineTo(translateX + point1.x, translateY - point1.y + -100 + noise(xoff + 0.01, yoff) * 200);
            xoff += 0.03;
        }
        yoff += 0.05;
    }
    ctx.closePath();
    ctx.stroke();
    // ctx.fill();

}

function rotatePoint(point, theta)
{
    theta *= -1;
    let z = K2 + point.z * Math.cos(theta) - point.y * Math.sin(theta);
    if (z == 0)
        z += 0.01;
    return {
        x: point.x,
        y: point.y * Math.cos(theta) + point.z * Math.sin(theta),
        z: z
    }
}

function clearFrame()
{
    //set background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function map(x, maxX)
{
    return x / maxX;
}

function updateAngle(e)
{
    terrainAngle = e.value;
    // console.log(e.value)
}