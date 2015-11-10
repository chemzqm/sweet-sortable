/*global describe, it, beforeEach, afterEach*/
var assert = require('assert')
var Touch = require('touch-simulate')
var Sortable = require('..')

var ul
var h
beforeEach(function () {
  ul = document.createElement('ul')
  ul.style.padding = '0px'
  ul.style.fontSize = '14px'
  ul.style.margin = '0px'
  ul.style.overflow = 'hidden'
  var li = document.createElement('li')
  ul.appendChild(li)
  document.body.appendChild(ul)
  h = li.getBoundingClientRect().height
  ul.removeChild(li)
})

afterEach(function () {
  document.body.removeChild(ul)
})

function append(n) {
  for(var i = 0; i < n; i ++) {
    var li = document.createElement('li')
    li.textContent = i
    ul.appendChild(li)
  }
}

describe('Sortable()', function() {
  it('should init with new', function () {
    var s = new Sortable(ul)
    assert.equal(s.el, ul)
  })

  it('should init with option', function () {
    var s = new Sortable(ul, {delta: 5})
    assert.equal(s.el, ul)
    assert.equal(s.delta, 5)
  })

  it('should init without new', function () {
    var s = Sortable(ul)
    assert.equal(s.el, ul)
  })

  it('should throw when no element passed', function () {
    var err
    try {
      Sortable()
    } catch (e) {
      err = e
    }
    assert(!!err.message)
  })
})

describe('.ignore()', function () {
  it('should ignore', function () {
    append(1)
    var li = document.createElement('li')
    li.disabled = true
    var s = Sortable(ul)
    s.bind('li').ignore('[disabled]')
    var t = Touch(li)
    t.start()
    return t.wait(110).then(function () {
      assert.equal(s.dragging, false)
    })
  })
})

describe('.handler', function () {
  it('should not dragging', function () {
    append(2)
    var li = ul.querySelector('li')
    var s = Sortable(ul)
    s.bind('li').handle('.handler')
    var t = Touch(li)
    t.start()
    return t.wait(110).then(function () {
      assert.equal(s.dragging, false)
    })
  })

  it('should dragging with handler', function () {
    append(2)
    var li = ul.querySelector('li')
    var span = document.createElement('span')
    span.textContent = '≡'
    span.className = 'handler'
    li.appendChild(span)
    var s = Sortable(ul)
    s.bind('li').handle('.handler')
    var t = Touch(span)
    t.start()
    return t.wait(110).then(function () {
      assert.equal(s.dragging, true)
    })
  })
})

describe('.bind()', function () {
  it('should bind to element of selector', function () {
    append(5)
    var s = Sortable(ul)
    s.bind('li')
    var li = ul.querySelector('li')
    var t = Touch(li)
    t.start()
    return t.wait(110).then(function () {
      assert.equal(s.dragging, true)
    })
  })

  it('should not bind to element not match', function () {
    append(5)
    var div = document.createElement('div')
    ul.appendChild(div)
    var s = Sortable(ul)
    s.bind('li')
    var t = Touch(div)
    t.start()
    return t.wait(110).then(function () {
      assert.equal(s.dragging, false)
    })
  })
})

describe('move', function () {
  this.timeout(5000)
  function moveMoment(count, index, angel, speed, dis) {
    append(count)
    var s = Sortable(ul)
    s.bind('li')
    var li = ul.children[index]
    var t = Touch(li, {speed: speed})
    return t.move(angel, h*dis).then(function () {
      // wait for end transition
      return t.wait(500)
    })
  }

  it('should move element up', function () {
    var p = moveMoment(2, 1, 1.5*Math.PI, 100, 1)
    return p.then(function () {
      assert.equal(ul.textContent, '10')
    })
  })

  it('should move element down', function () {
    var p = moveMoment(2, 0, 0.5*Math.PI, 100, 1)
    return p.then(function () {
      assert.equal(ul.textContent, '10')
    })
  })

  it('should move down and keep order', function () {
    var p = moveMoment(5, 0, 0.5*Math.PI, 100, 5)
    return p.then(function () {
      assert.equal(ul.textContent, '12340')
    })
  })

  it('should move up and keep order', function () {
    var p = moveMoment(5, 4, 1.5*Math.PI, 100, 5)
    return p.then(function () {
      assert.equal(ul.textContent, '40123')
    })
  })

  it('should works when move up and down several times', function () {
    append(3)
    var s = Sortable(ul)
    var li = ul.children[1]
    var t = Touch(li, {speed: 80})
    var pre = ul.textContent
    return t.moveUp(h, false).then(function () {
      return t.moveDown(h, false)
    }).then(function () {
      return t.moveUp(h, false)
    }).then(function () {
      return t.moveDown(h, false)
    }).then(function () {
      return t.wait(300)
    }).then(function () {
      assert.equal(s.dragging, false)
      assert.equal(pre, ul.textContent)
    })
  })
})

describe('horizon', function () {
  this.timeout(5000)
  var w = 50
  function appendHorizon(n) {
    for(var i = 0; i < n; i ++) {
      var li = document.createElement('li')
      li.style.padding = '0px'
      li.style.margin = '0px'
      li.style.float = 'left'
      li.style.display = 'block'
      li.style.width = '50px'
      li.style.textAlign = 'center'
      li.textContent = i
      ul.appendChild(li)
    }
  }

  function moveMoment(count, index, angel, speed, dis) {
    appendHorizon(count)
    var s = Sortable(ul)
    s.bind('li').horizon()
    var li = ul.children[index]
    var t = Touch(li, {speed: speed})
    return t.move(angel, w*dis).then(function () {
      // wait for end transition
      return t.wait(310)
    })
  }

  it('should move right and keep order', function () {
    var p = moveMoment(5, 0, 0, 200, 5)
    return p.then(function () {
      assert.equal(ul.textContent, '12340')
    })
  })
  it('should move left and keep order', function () {
    var p = moveMoment(5, 4, Math.PI, 200, 5)
    return p.then(function () {
      assert.equal(ul.textContent, '40123')
    })
  })
})

describe('.remove()', function () {
  it('should unbind all events', function () {
    var fired
    // change the function, be careful
    function prependFn(o, name) {
      var orig = o[name]
      var fn = function () {
        fired = true
        orig.apply(this, arguments)
      }
      o[name] = fn
    }
    var s = Sortable(ul)
    prependFn(s, 'ontouchstart')
    prependFn(s, 'ontouchmove')
    prependFn(s, 'ontouchend')
    append(2)
    s.bind('li')
    s.unbind()
    s.on('start', function () {
      fired = true
    })
    var li = ul.firstChild
    var t = Touch(li)
    return t.moveDown(h).then(function () {
      assert(fired !== true)
    })
  })
})
