const fs = require('fs');
const path = require('path');

const pngPath = path.join(__dirname, 'assets', 'logo-vmax.png');
const icoPath = path.join(__dirname, 'assets', 'icon.ico');
const iconPngPath = path.join(__dirname, 'assets', 'icon.png');

const { execSync } = require('child_process');

if (fs.existsSync(icoPath) && fs.existsSync(iconPngPath)) {
    console.log('Icon files already present in assets/icon.ico and assets/icon.png');
    process.exit(0);
}

if (fs.existsSync(pngPath)) {
    let pythonSuccess = false;
    const pythonCmds = [
        'python3',
        'python',
        'C:\\laragon\\bin\\python\\python-3.13\\python.exe'
    ];

    for (const py of pythonCmds) {
        try {
            const pyCmd = `"${py}" -c "from PIL import Image; img=Image.open('${pngPath.replace(/\\/g, '/')}'); img.resize((512,512)).save('${iconPngPath.replace(/\\/g, '/')}'); img.resize((256,256)).save('${icoPath.replace(/\\/g, '/')}', format='ICO', sizes=[(256,256),(128,128),(64,64),(48,48),(32,32),(16,16)])"`;
            execSync(pyCmd, { stdio: 'ignore' });
            pythonSuccess = true;
            break;
        } catch (e) {}
    }

    if (!pythonSuccess) {
        const pngBuffer = fs.readFileSync(pngPath);
        const header = Buffer.alloc(22);
        header.writeUInt16LE(0, 0);
        header.writeUInt16LE(1, 2);
        header.writeUInt16LE(1, 4);
        header.writeUInt8(0, 6);
        header.writeUInt8(0, 7);
        header.writeUInt8(0, 8);
        header.writeUInt8(0, 9);
        header.writeUInt16LE(1, 10);
        header.writeUInt16LE(32, 12);
        header.writeUInt32LE(pngBuffer.length, 14);
        header.writeUInt32LE(22, 18);

        const icoBuffer = Buffer.concat([header, pngBuffer]);
        fs.writeFileSync(icoPath, icoBuffer);
        fs.writeFileSync(iconPngPath, pngBuffer);
    }
    console.log('Icon files generated in assets/icon.ico and assets/icon.png');
}
