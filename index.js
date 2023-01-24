const fs = require("fs");
const { parse } = require("csv-parse");



let csvData = [];

let membersseeder = ''


fs.createReadStream("./sitting_members.csv")
    .pipe(parse({ delimiter: ",", from_line: 2 }))
    .on("data", function (row) {

        csvData.push(row);
    })
    .on("end", function () {


        const mapc2id = new Map();
        for (let i = 0; i < csvData.length; i++) {

            mapc2id.set(csvData[i][1].trim(), i + 1)

            membersseeder += `[
                'id'             => ${i + 1},
                'name'           => '${csvData[i][0]}',
                'constituency'   => '${csvData[i][1]}',
                'as_amount'          => 0,
               
            ],\n`;

        }

        readsdf(mapc2id)


    })
    .on("error", function (error) {
        console.log(error.message);
    });


function readsdf(mapc2id) {

    let csvSdf = [];

    var chars = "23456789abcdefghjkmnpqrstuvwxyz";
    var passwordLength = 4;

    let usermembersync = ''
    let usersseeder = ''
    let userroles = ''
    let usersseederforprint = 'Name;tEmail;Password\n';
    fs.createReadStream("./KLIBF SDF Constituency.csv")
        .pipe(parse({ delimiter: ",", from_line: 1 }))
        .on("data", function (row) {

            csvSdf.push(row);

            // console.log(row)

        })
        .on("end", function () {

            let item = [];

            let id = 2
            for (let i = 0; i < csvSdf.length; i++) {

                if (csvSdf[i][0] == id - 1) { //start of an item


                    if (id >= 3) {
                        usersseeder += `[
                            'id'             => ${item['id']},
                            'name'           => '${item['name']}',
                            'email'          => '${item['email']}',
                            'team_details'          => '${item['team']}',
                            'password'       => bcrypt('${item['password']}'),
                            'remember_token' => null,
                        ],\n`;
                        // usersseederforprint += `${item['name']};${item['email']};${item['password']};\"${item['team']}\"\n`;
                        usersseederforprint += `${item['name']};${item['email']};${item['password']}\n`;
                        item = [];
                    }

                    item['id'] = id++;
                    item['name'] = `Team ${id - 2}`;
                    item['email'] = `team${id - 2}@klibf.com`;
                    var password = "";
                    for (let k = 0; k < passwordLength; k++) {
                        var randomNumber = Math.floor(Math.random() * chars.length);
                        password += chars.substring(randomNumber, randomNumber + 1);
                    }

                    item['password'] = password;
                    item['team'] = csvSdf[i][1] + ' - ' + csvSdf[i][2];



                    //constituencies
                    let member_ids = [];
                    let cs = csvSdf[i][3].split("\n");
                    for (let j = 0; j < cs.length; j++) {
                        let c = cs[j].trim();
                        //find id
                        if (mapc2id.get(c) == undefined) {
                            console.log(c + ' not found');
                        } else {
                            member_ids.push(mapc2id.get(c));

                        }

                    }

                    usermembersync += `User::findOrFail(${id - 1})->members()->sync(array(${member_ids.toString()}));\n`;

                    userroles += `User::findOrFail(${id - 1})->roles()->sync(2);\n`

                } else {
                    // console.log(csvSdf[i][1]);

                    item['team'] = item['team'] + '\n' + csvSdf[i][1] + ' - ' + csvSdf[i][2];
                }

            }
            //last 
            usersseeder += `[
                'id'             => ${item['id']},
                'name'           => '${item['name']}',
                'email'          => '${item['email']}',
                'team_details'          => '${item['team']}',
                'password'       => bcrypt('${item['password']}'),
                'remember_token' => null,
            ],\n`;
            usersseederforprint += `${item['name']};${item['email']};${item['password']}\n`;

            //  console.log(usermembersync);
            console.log(usersseeder);
            //  console.log(userroles);
            //  console.log(membersseeder);
            console.log(usersseederforprint);


        })
        .on("error", function (error) {
            console.log(error.message);
        });



}