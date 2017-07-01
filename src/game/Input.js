function OnInputChange(_cb){
  document.onkeydown = function(e) {
    onKey(e, true);
  };

  document.onkeyup = function(e) {
    onKey(e, false);
  };

  function doCB(e, input){
    e.preventDefault();
    _cb(input)
  }

  function onKey(e, state){
    const cb = doCB.bind(this, e);
    switch (e.keyCode) {
      case 37:
        cb({left: state});
        break;
      case 38:
        cb({up: state});
        break;
      case 39:
        cb({right: state});
        break;
      case 40:
        cb({down: state});
        break;
      default:
        break;
    }
  }
}

const DefaultInput = () => {
  return {
    up: false,
    down: false,
    left: false,
    right: false
  };
}

export { OnInputChange, DefaultInput };