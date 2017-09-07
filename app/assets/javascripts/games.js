var currentGame = {}
var showForm = false;
var showCharForm = false;
var editingGame;
var editingCharacter;

$(document).ready( function() {
  function toggle() {
    showForm = !showForm
    $('#game-form').remove();
    $('#games-list').toggle();

    if (showForm) {
      $.ajax({
        url: '/game_form',
        method: 'GET',
        data: { id: editingGame }
      }).done( function(html) {
        $('#toggle').after(html)
      });
    }
  };

  function charToggle() {
    showCharForm = !showCharForm
    $('#character-form').remove();
    $('#characters').toggle();

    if (showCharForm) {
      $.ajax({
        url: '/characters_form',
        method: 'GET',
        data: { id: editingCharacter, game_id: currentGame.id }
      }).done( function(html) {
        $('#show-char').after(html)
      })
    }
  }

  function getChar(char) {
    $.ajax({
      url: '/games/' + char,
      method: 'GET'
    }).done( function(character) {
      if (editingCharacter) {
        var row = $("[data-char='" + editingCharacter + "']")
        $(row).replaceWith(character)
        editingCharacter = null
      } else {
        $('#characters').append(character)
      }
    })
  }

  function getGame(id) {
    $.ajax({
      url: '/games/' + id,
      method: 'GET',
    }).done( function(game) {
      if (editingGame) {
        var li = $("[data-id='" + id + "'")
        $(li).parent().replaceWith(game)
        editingGame = null
      } else {
        $('#games-list').append(game);
      }
    });
  }

  $(document).on('submit', '#character-form form', function(e) {
    e.preventDefault();
    var data = $(this).serializeArray();
    var url = '/games/' + currentGame.id + '/characters'
    var method = 'POST'

    if (editingCharacter) {
      url = url + '/' + editingCharacter;
      method: 'PUT'
    }

    $.ajax({
      url: url,
      type: method,
      data: data
    }).done( function() {
      charToggle();
    })
  })


  $(document).on('submit', '#game-form form', function(e) {
    e.preventDefault();
    var data = $(this).serializeArray();
    var url = '/games';
    var method = 'POST';

    if (editingGame) {
      url = url + '/' + editingGame;
      method: 'PUT'
    }

    $.ajax({
      url: url,
      type: method,
      dataType: 'JSON',
      data: data
    }).done( function(game) {
      toggle();
      getGame(game.id)
    }).fail( function(err) {
      alert(err.responseJSON.errors)
    });
  });

  $('#toggle').on('click', function() {
    toggle();
  });

  $(document).on('click', '#edit-game', function() {
    editingGame = $(this).siblings('.game-item').data().id
    toggle();
  });

  $(document).on('click', '#delete-character', function() {
    editingCharacter = $(this).parent('.character-item').data().char;
    $.ajax({
      url: '/games/' + currentGame.id + '/characters/' + editingCharacter,
      method: 'DELETE'
    }).done( function() {
      var row = $("[data-char='" + editingCharacter + "']");
      row.remove();
    })
  })

  $(document).on('click', '#delete-game', function() {
    var id = $(this).siblings('.game-item').data().id;
    $.ajax({
      url: '/games/' + id,
      method: 'DELETE'
    }).done( function() {
      var row = $("[data-id='" + id + "'");
      row.parent('li').remove();
    });
  });

  $(document).on('click', '.game-item', function() {
    currentGame.id = this.dataset.id
    currentGame.name = this.dataset.name

    $.ajax({
      url: '/games/' + currentGame.id + '/characters',
      method: 'GET',
      dataType: 'JSON'
    }).done( function(characters) {
      $('#game').text('Characters in ' + currentGame.name)
      var list = $('#characters');
      list.empty()
      characters.forEach( function(char) {
        var li = '<li class="character-item" data-char="'
                + char.id + '" data-character-name="' + char.name + '">' + char.name + '-' + char.power +
                '<br><button class= "btn" id="edit-character">Edit</button><button class="btn" id ="delete-character">Delete</button></li>'
        list.append(li)
      });
    });
    $(document).on('click', '#edit-character', function() {
      editingCharacter = $(this).parent('.character-item').data().char
      charToggle();
    })
    $(document).on('click', '#show-char', function() {
      charToggle();
    })
  });
});
