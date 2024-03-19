require('./Logging.js').run()
const fs = require('fs');
const userdb = "./users";
const readline = require('readline');
const bcrypt = require('bcrypt');
require("dotenv").config();
console.clear()
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
var timerclear = setInterval(function() {
    if (fs.existsSync(`./login/controllock`)) {
        fs.readdirSync(`./login/`).forEach(loginfile => {
            fs.unlinkSync(`./login/${loginfile}`)
        })
    }
}, 10000);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function logger(string) {
    console.log("Logged")
    if (!fs.existsSync("./log.txt")) fs.writeFileSync(`./log.txt`, "Start of Log\n\n ");
    fs.appendFileSync(`./log.txt`, string);
}

function CheckPreviousLogin() {
    console.log("Login Found, Logging in...")
    logger("Login Found, Logging in...")
    fs.readdirSync(`./login/`).forEach(logininfo => {
        const readFile = fs.readFileSync(`./login/${logininfo}`)
        const usercheck1 = JSON.parse(readFile)
        if (fs.existsSync(`./users/${logininfo}`)) {
            const readfile2 = fs.readFileSync(`./users/${logininfo}`)
            const usercheck2 = JSON.parse(readfile2)
            if (usercheck1.username == usercheck2.username && usercheck1.password == usercheck2.password && usercheck1.userID == usercheck2.userID) {
                fs.unlinkSync(`./login/${logininfo}`)

                SignedIn(usercheck2.username, usercheck2.userID, usercheck2.password)
            }
        }
    })
}

function startup() {
    if (!fs.existsSync("./login")) fs.mkdirSync("./login"); // Create login folder if it doesn't exist
    if (fs.existsSync(`./users/0.json`)) fs.unlinkSync(`./users/0.json`); // Remove the 0.json file if it exists
    if (fs.existsSync(`./login/controllock`)) CheckPreviousLogin(); // Check if there is a previous login

    rl.question(`Welcome to the DDC Auth System \n1. Login \n2. Create\n`, (answer) => {
        if (answer == 1) {
            userLogin()
        } else if (answer == 2) {
            userCreate()
        } else if (answer == 1234512345) {
            if (fs.existsSync(`./login/controllock`)) {
                fs.readdirSync(`./login/`).forEach(logininfo => {
                    const readFile = fs.readFileSync(`./login/${logininfo}`)
                    const usercheck1 = JSON.parse(readFile)
                    if (fs.existsSync(`./users/${logininfo}`)) {
                        const OwneruserID = usercheck1.userID
                        const OwnerRoles = usercheck1.Roles
                        const OwnerUsername = usercheck1.username
                        OwnersPanel(OwneruserID, OwnerRoles, OwnerUsername)
                    }
                })
            } else {
                console.clear()
                startup()
            }
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
    if (!fs.existsSync("./users")) {
        fs.mkdirSync("./users")
    }
    if (!fs.existsSync("./login")) {
        fs.mkdirSync("./login")
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
    if (!fs.existsSync("./users")) {
        fs.mkdirSync("./users")
    }
    console.clear()
    console.log("Loading User Create...")
    let user = {
        username: "",
        password: "",
        userID: 0,
        Roles: []
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
                const salt = bcrypt.genSaltSync(Number(process.env.SALTROUNDS));
                const hash = bcrypt.hashSync(answer, salt);
                user.password = hash
                const useridcheck = fs.readFileSync(`./conf/userid.txt`)
                const userid = Number(useridcheck)
                const newuserid = userid + 1;
                const newuseridstring = newuserid.toString()
                fs.writeFileSync(`./conf/userid.txt`, newuseridstring)
                user.userID = newuserid
                user.Roles = ["User"]
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
        if (fs.existsSync("./login/*.json")) { fs.unlinkSync(`./login/*.json`) }
        let user = {
            username: "",
            password: "",
            userID: 0,
            Roles: []
        }
        user.username = username
        user.password = password
        user.userID = userID
        user.Roles = user.Roles.concat(user.Roles)
        fs.writeFileSync(`./login/controllock`, "1")
        fs.writeFileSync(`./login/${user.username}.json`, JSON.stringify(user))
        if (user.userID == 1 && user.Roles.includes("Admin")) {
            console.log("You are an admin.")
            console.log("Logging into Admin Panel")
            sleep(2000).then(() => { AdminLogin(user.username, user.userID, user.Roles) });
        } else if (user.userID == userID) {
            console.clear();
            UserPanel(username, password, userID, user.Roles);
        } else {
            console.log("Auth Failed Error 1 || AUTH FAILED. USERID + USERNAME DOES NOT MATCH.")
        }
    } else { console.log("Auth Failed Error 2 || AUTH FAILED. USERID + USERNAME DOES NOT MATCH.") }
}

function UserPanel(username, password, userID, roles) {
    console.clear()
    console.log(`Welcome ${username} || User ${userID}`)
    console.log("User Panel")
    rl.question(`1. Change Password\n2. Logout\n`, (answer) => {
        if (roles.includes("Admin")) {
            console.log("3. Admin Panel\n")
            if (answer == 3) {
                console.clear()
                console.log("Loading Admin Panel...")
                sleep(2000).then(() => { AdminLogin(username, userID, roles) });
            }
        }
        if (roles.includes("Owner")) {
            console.log("4. Owner Panel\n")
            if (answer == 4) {
                console.clear()
                console.log("Loading Owner Panel...")
                sleep(2000).then(() => {
                    console.clear();
                    OwnerPanel(username, userID, roles)
                });
            }
        }


        if (answer == 1) {
            console.clear()
            console.log("Loading Change Password...")
            rl.question(`Enter 0 to go back.\nNew Password: `, (answer) => {
                if (answer == 0) {
                    console.clear()
                    UserPanel(username, password, userID, roles)
                }
                const salt = bcrypt.genSaltSync(Number(process.env.SALTROUNDS));
                const hash = bcrypt.hashSync(answer, salt);
                const usercheck = fs.readFileSync(`./users/${username}.json`)
                const user = JSON.parse(usercheck)
                user.password = hash
                fs.writeFileSync(`./users/${username}.json`, JSON.stringify(user))
                console.log("Password Changed.")
                sleep(2000).then(() => {
                    console.clear();
                    UserPanel(username, password, userID, roles)
                });
            })
        } else if (answer == 2) {
            console.clear()
            fs.readdirSync("./login").forEach(file => {
                fs.unlinkSync(`./login/${file}`)
            })
            startup()
        } else {
            console.clear()
            console.log("Invalid Input.")
            sleep(2000).then(() => {
                console.clear();
                UserPanel(username, password, userID, roles)
            });
        }
    })
}

function AdminLogin(username, userID, Roles) {
    if (userID == 1 && Roles.includes("Admin")) {
        console.clear()
        console.log("Loading Admin Panel...")
        rl.question(`Welcome ${username}\n1. Delete Account via username.\n`, (answer) => {
            if (answer == 1) {
                DeleteUser(userID, Roles, username)
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
        sleep(2000).then(() => {
            console.clear();
            startup()
        });
    }
};

function OwnersPanel(userID, Roles, username) {
    if (userID == 1 && Roles.includes("Owner")) {
        console.clear()
        console.log("Loading Owners Panel...")
        rl.question(`Welcome ${userID}\n1. Create Account\n2. Delete Account via username.\n3. Add user to Admin Group. \n4. Remove user from Admin Group.\n5. Check User's Roles.`, (answer) => {
            if (answer == 1) {
                userCreate()
            } else if (answer == 2) {
                DeleteUser(userID, Roles, username)
            } else if (answer == 3) {

            } else if (answer == 4) {

            } else if (answer == 5) {

            } else {
                console.log("Invalid Input.")
                sleep(2000).then(() => {
                    console.clear();
                    OwnersPanel(userID, Roles, username)
                });
            }
        })
    }
};

function DeleteUser(userID, Roles, username) {
    if (Roles.includes("Owner") || Roles.includes("Admin")) {
        console.clear()
        rl.question(`Enter the Username to delete. \n Enter 0 to go back. \nUsername: `, (answer) => {
            if (fs.existsSync(`./users/${answer}.json`)) {
                if (answer == username) {
                    console.log("You cannot delete your own account.")
                    DeleteUser(userID, Roles, username)
                } else if (answer == 0) {
                    console.clear()
                    startup()
                } else {
                    fs.unlinkSync(`./users/${answer}.json`)
                    console.log("User Deleted.")
                    const useridcheck = fs.readFileSync(`./conf/userid.txt`)
                    const userid = Number(useridcheck)
                    const newuserid = userid - 1;
                    const newuseridstring = newuserid.toString()
                    fs.writeFileSync(`./conf/userid.txt`, newuseridstring)
                    sleep(2000).then(() => {
                        console.clear();
                        AdminLogin(username, userID, Roles)
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
    }
}

startup()