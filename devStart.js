
const { exec } = require('child_process');

    const commands = [
        `npm install`,
        `npx sequelize db:create`,
        `npx sequelize db:migrate`,
        `npx sequelize db:seed:all`,
        `node ./logs/startLog.js`,
        `node app.js`,
    ];


    const execPromise = (cmd) => {
        return new Promise(function (resolve, reject) {
            exec(`powershell.exe -Command "${cmd}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error: ${stderr}`);
                    reject(error)
                } else {
                    console.log(`Command output:\n${stdout}`);
                    resolve(stdout)
                }
            })
        })
    };

(async () => {
    for await (const el of commands) {
        try {
            await execPromise(el)

        } catch (error) {
            console.error(`Command failed: ${error.message}`);
        }
    }
})()