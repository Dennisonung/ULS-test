const fs = require('fs');
const userdb = "./users";
const readline = require('readline');
const bcrypt = require('bcrypt');
const { parse } = require('path');
const saltRounds = 5;
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
            sleep(1000).then(() => {
                console.clear();
                startup()
            });
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

                if (bcrypt.compareSync(answer, user.password)) {
                    console.log("Login Successful.")
                    sleep(2000).then(() => {
                        console.clear();
                        SignedIn(user.username, user.userID)
                    });
                } else {
                    console.log("Login Failed.")
                    sleep(2000).then(() => {
                        console.clear();
                        userLogin()
                    });
                }
            })
        } else if (answer == 0) {
            console.clear()
            startup()
        } else {
            console.clear()
            console.log("User not found.")
            sleep(2000).then(() => {
                console.clear();
                userLogin()
            });
        }
    })
}

function userCreate() {
    console.clear()
    console.log("Loading User Create...")
    let user = {
        username: "",
        password: "",
        userID: 0
    }
    rl.question(`Enter 0 to go back.\nNew username: `, (answer) => {
        if (fs.existsSync(`./users/${answer}.json`)) {
            console.log("Username already taken.")
            sleep(2000).then(() => {
                console.clear();
                userCreate()
            });
        } else if (answer == 0) {
            console.clear()
            startup()
        } else {
            user.username = answer
            rl.question(`New password: `, (answer) => {
                const salt = bcrypt.genSaltSync(saltRounds);
                const hash = bcrypt.hashSync(answer, salt);
                user.password = hash
                const useridcheck = fs.readFileSync(`./conf/userid.txt`)
                const userid = Number(useridcheck)
                const newuserid = userid + 1;
                const newuseridstring = newuserid.toString()
                fs.writeFileSync(`./conf/userid.txt`, newuseridstring)
                user.userID = newuserid
                fs.writeFileSync(`${userdb}/${user.username}.json`, JSON.stringify(user))
                console.log("User Created.")
                sleep(2000).then(() => {
                    console.clear();
                    startup()
                });

            })
        }
    })
}

function SignedIn(username, userID) {
    const usercheck = fs.readFileSync(`./users/${username}.json`)
    const user = JSON.parse(usercheck)
    if (user.userID == 1) {
        console.log("You are an admin.")
        console.log("Logging into Admin Panel")
        sleep(2000).then(() => { AdminLogin(user.username, user.userID) });
    } else if (user.userID == userID) {
        console.clear()
        console.log(`Welcome ${user.username} || User ${userID}`)
        rl.question(`e`, (answer) => {

        })
    } else { console.log("Auth Failed Error 1 || AUTH FAILED. USERID + USERNAME DOES NOT MATCH.") }
}

function AdminLogin(username, userID) {
    if (userID == 1) {
        console.clear()
        console.log("Loading Admin Login...")
        rl.question(`Welcome ${username}\n1. Delete Account via username.\n`, (answer) => {
            if (answer == 1) {
                rl.question(`Enter the Username to delete. \nUsername:\n`, (answer) => {
                    if (fs.existsSync(`./users/${answer}.json`)) {
                        if (answer == username) {
                            console.log("You cannot delete your own account.")
                            startup()
                        } else {
                            fs.unlinkSync(`./users/${answer}.json`)
                            console.log("User Deleted.")
                            sleep(2000).then(() => {
                                console.clear();
                                startup()
                            });
                        }

                    } else {
                        console.log("User not found.")
                        sleep(2000).then(() => {
                            console.clear();
                            startup()
                        });
                    }
                })
            } else {
                console.log("Invalid Input.")
                sleep(2000).then(() => {
                    console.clear();
                    startup()
                });
            }
        })
    } else {
        console.log("Auth Failed Error 4 || AUTH FAILED. NON-ADMIN")
    }
}

startup()