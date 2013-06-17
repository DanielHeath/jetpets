var Player  = require('./player');
var game    = require('./game');
var _       = require('underscore');

exports.register = function(app) {

  // mobile landing page
  app.get('/', function(req, res) {
    res.header('Cache-Control', 'no-cache');
    res.redirect('/device')
  })

  // connect a device to a player (PIN)
  app.post('/connect/:pin', function(req, res) {
    res.header('Cache-Control', 'no-cache');
    var pin = parseInt(req.params.pin, 10);
    var p = Player.withPin(pin);
    if (!p) {
      res.status(403).send('Invalid PIN');
    } else {
      res.send({
        id: p.id,
        name: p.name
      });
    }
  });

  // get all players (for leaderboard)
  app.get('/player', function(req, res) {
    res.header('Cache-Control', 'no-cache')
    res.send(Player.all());
  });

  // create a player
  app.post('/player', function(req, res) {
    res.header('Cache-Control', 'no-cache');
    var p = Player.create(req.body);
    res.send(p);
  });

  // delete a player
  app.delete('/player/:playerId', function(req, res) {
    res.header('Cache-Control', 'no-cache');
    var p = Player.withId(req.params.playerId);
    if (!p) {
      res.status(404).send('Player unknown');
    } else {
      Player.delete(p);
      res.send({deleted: p.id});
    }
  });

  // get the game state
  app.get('/game/status', function(req, res) {
    res.header('Cache-Control', 'no-cache')
    res.send({
      inProgress: game.inProgress(),
      players: game.getPlayers()
    });
  });

  // finish the game (sent by the game itself)
  app.post('/game/status', function(req, res) {
    var players = req.body.players

    if (_.uniq(_.pluck(players, 'score')).length === 1) {
      // we have a draw! everybody wins
      req.body.players.forEach(function(player) {
        var gamePlayer = Player.withId(player.id)

        if (gamePlayer) {
          gamePlayer.topScore += parseInt(player.score)
        }
      })
    } else {
      // only bump the winning player's score
      var winner = _.max(req.body.players, function(player) { return player.score })
      var winningPlayer = Player.withId(winner.id)
      winningPlayer.topScore += parseInt(winner.score)
    }

    Player.saveAll()

    game.clear();

    res.header('Cache-Control', 'no-cache')
    res.send({
      finished: game.inProgress(),
      players: game.getPlayers()
    });
  });

  // try to join the game
  app.post('/game/players', function(req, res) {
    res.header('Cache-Control', 'no-cache')
    var p = Player.withId(req.body.playerId);
    if (!p) {
      res.status(404).send('Player unknown');
    } else if (game.inProgress()) {
      res.status(409).send('Game in progress');
    } else {
      game.addPlayer(p);
      res.send({
        inProgress: game.inProgress()
      });
    }
  });

  // leave the game
  app.delete('/game/players/:playerId', function(req, res) {
    res.header('Cache-Control', 'no-cache')
    var p = Player.withId(req.params.playerId);
    if (!p) {
      res.status(404).send('Player unknown');
    } else {
      game.removePlayer(p);
      res.send({
        players: game.getPlayers()
      });
    }
  });

  // send an action to the game
  app.post('/game/players/:playerId/:action', function(req, res) {
    res.header('Cache-Control', 'no-cache')
    var p = Player.withId(req.params.playerId);
    if (!p) {
      res.status(404).send('Player unknown');
    } else if (game.inProgress() === false) {
      res.status(404).send('No game in progress');
    } else if (game.hasPlayer(p) === false) {
      res.status(403).send('Player not in the current game');
    } else {
      game.send(p, req.params.action);
      res.send()
    }
  });

};
