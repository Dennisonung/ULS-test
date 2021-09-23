const fs = require('fs');
const userdb = "./users";
const readline = require('readline');
const bcrypt = require('bcrypt');
const path = require('path');
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



var timerclear = setInterval(function() {
    fs.unlink("./login/*.json")
}, 30 * 1000); 


function startup() {
    if (fs.existsSync(`./users/0.json`)) {
        fs.unlinkSync(`./users/0.json`)
    } else if (fs.existsSync(`./login/*`)) {
        console.log("Login Found, Logging in...")
        fs.readdirSync(`./login`).forEach(file => {
            for (let file of files) {
                const usercheck1 = JSON.parse(`./login/${file}`)
                if (fs.existsSync(`./users/${file}`)) {
                    usercheck2 = JSON.parse(`./users/${file}`)
                    if (usercheck1.username == usercheck2.username && usercheck1.password == usercheck2.password && usercheck1.userID == usercheck2.userID) {
                        fs.unlinkSync(`./login/${file}`)
                        console.clear()
                        SignedIn(usercheck2.username, usercheck2.userID, usercheck3.password)
                    }
                }

            }
        })
    } else {
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
}

function userLogin() {
    console.clear()
    console.log("Loading User Login...")
    if(!fs.existsSync("./users")) {
        fs.mkdirSync("./users")
    }
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
                        clearInterval(timerclear);
                        SignedIn(user.username, user.userID, user.password)
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

function SignedIn(username, userID, password) {
    const usercheck = fs.readFileSync(`./users/${username}.json`)
    const user = JSON.parse(usercheck)
    if (username == user.username && password == user.password && userID == user.userID) {
        if (fs.existsSync("./login/*.json")) {fs.unlinkSync(`./login/*.json`)}
        let user = {
            username: "",
            password: "",
            userID: 0
        }
        user.username = username
        user.password = password
        user.userID = userID
        fs.writeFileSync(`./login/${user.username}.json`, JSON.stringify(user))
        if (user.userID == 1) {
            console.log("You are an admin.")
            console.log("Logging into Admin Panel")
            sleep(2000).then(() => { AdminLogin(user.username, user.userID) });
        } else if (user.userID == userID) {
            console.clear()
            console.log(`Welcome ${user.username} || User ${userID}`)
        } else { 
            console.log("Auth Failed Error 1 || AUTH FAILED. USERID + USERNAME DOES NOT MATCH.") 
        }
    } else { console.log("Auth Failed Error 2 || AUTH FAILED. USERID + USERNAME DOES NOT MATCH.") }
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
        sleep(2000).then(() => { console.clear(); startup() });
    }
}

startup()