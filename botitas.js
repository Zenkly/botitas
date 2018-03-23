const Discord = require('discord.js')
const request = require('request');
const steemjs = require('steem');
const moment = require('moment');

//dotenv.config();

const client = new Discord.Client();

const prefix = process.env.PREFIX;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log(`prefix = ${prefix}`);
});

client.on('message', msg => {
    if (!msg.author.bot) {

    const args = msg.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

////////////////////     ANTI SPAM         //////////////////////////
             ///////     Exclusive https       //////////

        if(msg.channel.id === '421075068173549571' || msg.channel.id == '399613332463681536' || msg.channel.id == '411973957877628938' || msg.channel.id == '400452279976722435' || msg.channel.id == '412115315900809226'){
          if (msg.content.includes(" ")) {
            console.log(`Enlace borrado: ${msg.content}`);
            msg.reply('Solo se permiten enlaces sin texto añadido :confused:');
            msg.delete();
          }
          else if(!msg.content.includes("https://")) {
            console.log(`Enlace borrado: ${msg.content}`);
            msg.reply(':point_up: Debes introducir un enlace');
            msg.delete();
          }
              ///////////////////////////////////////////
          else {
            var i=0;
            msg.channel.fetchMessages({ limit:100  , before: msg.id })
                .then(messages => {
                  //History=messages.array()
                  messages.array().forEach(function(mensaje, index, array) {
                        if( mensaje.content == msg.content ){
                            console.log(`${i} Url repetida: ${msg.content}`);
                            if(i<1){
                                msg.reply('Solo se permite promocionar tus post una sola vez :disappointed_relieved:')
                                msg.delete()
                                .then(msg => console.log(`Deleted message from ${msg.author.username}`))
                                .catch(console.error);
                              }
                              i=i+1;
                            }
                          });
                        })
                .catch(console.error);
              }
        }
////////////////////////////////////////////////////////////////////
//////////////////////// MODERADOR POSTULACIONES //////////////////
    else if(msg.channel.id === '405830409704701952'){
      if (!msg.content.substr(msg.content.lastIndexOf("/")).includes("@")) {
        console.log(`Enlace borrado: ${msg.content}`);
        msg.reply('Esta sala solo admite perfiles de personas que quieren ser miembros activos te inivitamos a revisar el mensaje anclado del canal');
        msg.delete();
        }
    }
///////////////////////////////////////////////////////////////////////
///////////////////////////        AVATAR  /////////////////////
    else if (msg.content.startsWith(prefix) && command === 'avatar') {
      if (!args.length) {
        return  msg.channel.send(`_***Mosquetero: ${msg.author.username} ***_
Mosquetero desde: ${msg.member.joinedAt}
Estado :  ${msg.author.presence.status}
Avatar :  ${msg.author.displayAvatarURL}
          `)
        }
        else if (!msg.mentions.users.size) {
          return msg.reply('Debes mencionar a un mosquetero usando "@" ');
        }
      console.log(`Avatar solicitado: ${msg.content}`);
      msg.mentions.users.map(user => {
      msg.channel.send(`_***Mosquetero: ${user.username} ***_
Mosquetero desde: ${msg.guild.member(user).joinedAt}
Estado :  ${user.presence.status}
Avatar :  ${user.displayAvatarURL}
      `)
     });
  //    .then(console.log)
  //    .catch(console.error);
  }
/////////////////////////////////////////////////////////////////////
//////////////////////// PRECIOS ////////////////////////////////
    else if (msg.content.startsWith(prefix) && command === 'precio') {
      let coinname = msg.content.toUpperCase().replace(prefix + 'PRECIO ', '');
      request('https://api.coinmarketcap.com/v1/ticker/' + coinname,
        function (error, res, body) {
          var obj = JSON.parse(body);
          if (obj[0] === undefined) {
            console.log("Moneda inválida");
            msg.channel.send('Moneda inválida :tired_face:');
          } else {
              const embed = new Discord.RichEmbed()
                .setThumbnail('https://files.coinmarketcap.com/static/img/coins/64x64/' + coinname.toLowerCase() + '.png')
                .setColor(0x00AE86)
                .setAuthor(obj[0].name + ' (' + obj[0].symbol + ')', ' ')
                .addField('Precio actual (USD)', obj[0].price_usd + ' USD (' + obj[0].percent_change_24h + '%)', true)
                .addField('Precio actual (BTC)', obj[0].price_btc + ' BTC (' + obj[0].percent_change_24h + '%)', true);
            msg.channel.send(embed);
        }
    });
    }
////////////////////////////////////////////////////////////////////////////////
    else if (msg.content.startsWith(prefix) && command === 'info') {
      let accountname = msg.content.replace(prefix + 'info ', '');
      steemjs.api.getAccounts([accountname],
       (err, result) => {
          if (result["0"] === undefined) {
              console.log("Cuenta inválida");
              msg.channel.send('Cuenta inválida :tired_face:');
          } else {
              let profile = JSON.parse(result[0].json_metadata).profile;
              try{
                var profile_image = profile.profile_image;
                console.log(profile_image)
                var name = profile.name;
                var about = profile.about;
                var location = profile.location;
              }
              catch(err){
                var profile_image = "https://s13.postimg.org/44xumfn9v/MOSQUETEROS_MINI.png";
                var name = accountname;
                var about = "undefined"
                var location = "undefined"
              }
              if (name === undefined) {
                  name = accountname;
              }

              let reputation = steemjs.formatter.reputation(result["0"].reputation);


              var secondsago = (new Date - new Date(result[0].last_vote_time + "Z")) / 1000;
              var vpow = result[0].voting_power + (10000 * secondsago / 432000);
              vtpower = Math.min(vpow / 100, 100).toFixed(2);


              var vesting_shares, delegated_vesting_shares, received_vesting_shares, total_vesting_shares, total_vesting_fund_steem = null;
              vesting_shares = result[0].vesting_shares;
              delegated_vesting_shares = result[0].delegated_vesting_shares;
              received_vesting_shares = result[0].received_vesting_shares;

              steemjs.api.getDynamicGlobalProperties(function (err, gresult) {

                  total_vesting_shares = gresult.total_vesting_shares;
                  total_vesting_fund = gresult.total_vesting_fund_steem;


                  var steem_power = steemjs.formatter.vestToSteem(vesting_shares, total_vesting_shares, total_vesting_fund);
                  var delegated_steem_power = steemjs.formatter.vestToSteem((received_vesting_shares.split(' ')[0] - delegated_vesting_shares.split(' ')[0]) + ' VESTS', total_vesting_shares, total_vesting_fund);

                  var today = moment(Date.now());
                  var accountcreated = moment(result[0].created);
                  var accountcreateddays = today.diff(accountcreated, 'days');

                  var lastvote = moment(result[0].last_vote_time).subtract(4, 'hours');

                  steemjs.api.getFollowCountAsync((accountname),
                      function (err, fresult) {

                          var follower_count = fresult.follower_count;
                          var following_count = fresult.following_count;

                          const embed = new Discord.RichEmbed()
                              .setImage(profile_image)
                              .setThumbnail("https://s13.postimg.org/44xumfn9v/MOSQUETEROS_MINI.png")
                              //.setColor(0x5795FE)
                              .setColor([77,238,22])
                              .setAuthor(msg.author.username+' nos presenta a '+name,msg.author.displayAvatarURL)
                              .setTitle("**Perfil**")
                              .setDescription("https://steemit.com/@"+result[0].name)
                              .addField('Reputación', reputation)
                              .addField('Descripción', about)
                              .addField('Ubicación', location)
                              .addField('Cuenta creada hace', accountcreateddays + ' días')
                              .addField('Steem Power', (steem_power + delegated_steem_power).toFixed(2) + ' SP ' + '(' + steem_power.toFixed(2) + ' / ' + delegated_steem_power.toFixed(2) + ')')
                              .addField('% VP', vtpower)
                              .addField('Último voto', lastvote.format("YYYY-MM-DD HH:mm"))
                              .addField('Seguidores', follower_count)
                              .addField('Siguiendo', following_count);
                          msg.channel.send(embed);

                      })
              });
          }
      });
}
///////     SALUDO y DESPEDIDA      ///////////////
        if(msg.guild.id == '399612641007632385'){
          let content = msg.content;
          let firstword = content.substring(0,4);
          if (firstword.toLowerCase() == 'hola') {
              msg.reply('¡Hola Mosqueter@!');
          }
          else if (firstword.toLowerCase() == 'adios') {
              msg.reply('¡Hasta luego Mosqueter@!');
          }
          else if (msg.content.toLowerCase().includes("buenos días")) {
              msg.reply('¡Hola Mosqueter@!');
          }
          else if (msg.content.toLowerCase().includes("buenas noches")) {
              msg.reply('¡Buenas noches Mosqueter@!');
          }
          else if (msg.content.toLowerCase().includes("buenas tardes")) {
              msg.reply('¡Buenas tardes Mosqueter@!');
          }
          else if (msg.content.toLowerCase().includes("buenas")) {
              msg.reply('¡Buenísimas Mosqueter@!');
          }
        }
//////////////////////////////////////////
    }
})

///////////////////// BIENVENIDA /////////////////////////////////////
client.on('guildMemberAdd', member => {
  // Send the message to a designated channel on a server:
  const channel = member.guild.channels.find('name', 'general');
  // Do nothing if the channel wasn't found on this server
  if (!channel) return;
  // Send the message, mentioning the member
  channel.send(`Bienvenid@ a Moqueteros, ${member}  :smiley:`);
  channel.send(`Por favor pasa al canal de #reglas para una mejor convivencia. Un gusto tenerte por acá.`);
});
////////////////////////////////////////////////////////////////////////

client.login(process.env.DISCORD_TOKEN);
