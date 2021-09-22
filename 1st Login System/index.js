const fs = require('fs');
const userdb = "./users";
const readline = require('readline');
console.log("Loading ReadLine Module...");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
console.log("Loaded Readline Module.");
console.log("Finished Loading.")
console.log("Starting...")
console.clear()

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function startup() {
    if (fs.existsSync(`./users/0.json`)) {
        fs.unlinkSync(`./users/0.json`)
    }
    rl.question(`Welcome to the DDC Auth System \n1. Login \n2. Create\n`, (answer) => {
        if (answer == 1) {
            userLogin()
        } else if (answer == 2) {
            userCreate()
        } else {
            console.log("Invalid Input.")
            sleep(1000).then(() => { console.clear(); startup() });
        }
    });
}

function userLogin() {
    console.clear()
    console.log("Loading User Login...")
    rl.question(`Enter 0 to go back.\nUsername: `, (answer) => {
        let username = answer
        if (fs.existsSync(`./users/${answer}.json`)) {
            rl.question(`Password: `, (answer) => {
                const readpassword = fs.readFileSync(`./users/${username}.json`)
                const user = JSON.parse(readpassword)
                if (user.password == answer) {
                    console.log("Login Successful.")
                    sleep(2000).then(() => { console.clear(); startup() });
                } else {
                    console.log("Login Failed.")
                    sleep(2000).then(() => { console.clear(); userLogin() });
                }
            })
        } else if (answer == 0) {
            console.clear()
            startup()
        } else {
            console.clear()
            console.log("User not found.")
            sleep(2000).then(() => { console.clear(); userLogin() });
        }
    })
}

function userCreate() {
    console.clear()
    console.log("Loading User Create...")
    let user = {
        username: "",
        password: "",
        email: "",
    }
    rl.question(`Enter 0 to go back.\nNew username: `, (answer) => {
        if (fs.existsSync(`./users/${answer}.json`)) {
            console.log("Username already taken.")
            sleep(2000).then(() => { console.clear(); userCreate() });
        } else if (answer == 0){
            console.clear()
            startup()
        } else {
            user.username = answer
            rl.question(`New password: `, (answer) => {
                user.password = answer
                fs.writeFileSync(`${userdb}/${user.username}.json`, JSON.stringify(user))
                console.log("User Created.")
                sleep(2000).then(() => { console.clear(); startup() });
                
            })
        }
    })
}

startup()

