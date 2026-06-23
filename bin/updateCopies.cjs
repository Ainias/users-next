const path = require('path');
const {exec} = require('child_process');
const fs = require('fs');

const packageName = require('../package.json').name;

const pathsToProjects = [
    '/Users/sguenter/Projekte/Privat/dnd',
    '/Users/sguenter/Projekte/Privat/bat',
    '/Users/sguenter/Projekte/Privat/jugend',
];

const deleteFolderRecursive = function (path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            const curPath = `${path  }/${  file}`;
            if (fs.lstatSync(curPath).isDirectory()) {
                // recurse
                deleteFolderRecursive(curPath);
            } else {
                // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

async function execPromise(command) {
    return new Promise((resolve, reject) => {
        console.log(`executing ${  command  }...`);
        exec(command, (err, stdout, stderr) => {
            console.log(stdout);
            console.log(stderr);
            if (err) {
                reject([err, stdout, stderr]);
            } else {
                resolve([stdout, stderr]);
            }
        });
    });
}

execPromise('npm pack')
    .then(async (std) => {
        const thisPath = process.cwd();
        const name = std[0].trim();
        const pathToTar = path.resolve(thisPath, name);

        if (!fs.existsSync('tmp')) {
            fs.mkdirSync('tmp');
        }
        process.chdir('tmp');
        await execPromise(`tar -xvzf ${  pathToTar  } -C ./`);
        process.chdir('package');
        // fs.unlinkSync('package.json');

        let promise = Promise.resolve();
        pathsToProjects.forEach((project) => {
            promise = promise.then(async () => {
                const resultDir = path.resolve(project, 'node_modules', packageName);
                console.log(resultDir, fs.existsSync(resultDir));
                if (!fs.existsSync(resultDir)) {
                    fs.mkdirSync(resultDir);
                }
                return execPromise(`cp -r ./* ${  resultDir}`);
            });
        });
        await promise;

        process.chdir(thisPath);
        fs.unlinkSync(name);
        deleteFolderRecursive('tmp');
        // fs.unlinkSync("tmp");

        console.log('done!');
    })
    .catch((error) => {
        console.error(error);
    });
