
var plan = require('flightplan');

var appName = 'nodeauthentication';
var username = 'deploy';
var startFile = 'bin/index';

var tmpDir = appName+'-' + new Date().getTime();

// configuration
plan.target('staging', [
  {
    host: '45.55.140.158',
    username: username,
    password: 'Fredp613$'    
    //agent: process.env.SSH_AUTH_SOCK
  }
]);

plan.target('production', [
  {
    host: '45.55.140.158',
    username: username,
    password: 'Fredp613$'    
//agent: process.env.SSH_AUTH_SOCK
  },
//add in another server if you have more than one
// {
//   host: '104.131.93.216',
//   username: username,
//   agent: process.env.SSH_AUTH_SOCK
// }
]);

//agent: process.env.SSH_AUTH_SOCK
// run commands on localhost
plan.local(function(local) {
  // uncomment these if you need to run a build on your machine first
  // local.log('Run build');
  // local.exec('gulp build');

  local.log('Copy files to remote hosts');
  var filesToCopy = local.exec('git ls-files', {silent: true});
  // rsync files to all the destination's hosts
  local.transfer(filesToCopy, '/tmp/' + tmpDir);
});

// run commands on remote hosts (destinations)
plan.remote(function(remote) {
  remote.log('Move folder to root');
  remote.sudo('cp -R /tmp/' + tmpDir + ' ~', {user: username});
  remote.rm('-rf /tmp/' + tmpDir);

  remote.log('Install dependencies');
  remote.sudo('npm --production --prefix ~/' + tmpDir + ' install ~/' + tmpDir, {user: username});

  remote.log('Reload application');
  remote.sudo('ln -snf ~/' + tmpDir + ' ~/'+appName, {user: username});
  remote.sudo('cp .env /home/deploy/'+appName+'/.env'
  remote.exec('sudo restart nodeauthentication');
//  remote.exec('node /home/deploy/node-app/bin/index.js');
//  remote.exec('forever stop ~/'+appName+'/'+startFile, {failsafe: true});
 // remote.exec('forever start ~/'+appName+'/'+startFile);
});
