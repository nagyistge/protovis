pv.VmlScene.dot = function(scenes) {
  var e = scenes.$g.firstChild;
  for (var i = 0; i < scenes.length; i++) {
    var s = scenes[i];

    /* visible */
    if (!s.visible) continue;
    var fill = pv.color(s.fillStyle), stroke = pv.color(s.strokeStyle);
    if (!fill.opacity && !stroke.opacity) continue;

    /* points */
    var radius = Math.round(Math.sqrt(s.size));
    var d;
    switch (s.shape) {
      case "cross": {
        d = "m" + -radius + "," + -radius
          + "l" + radius + "," + radius
          + "m" + radius + "," + -radius
          + "l" + -radius + "," + radius;
        break;
      }
      case "triangle": {
        var h = radius, w = Math.round(radius * 2 / Math.sqrt(3));
        d = "m0," + h
          + "l" + w +"," + -h
          + " " + -w + "," + -h
          + "x";
        break;
      }
      case "diamond": {
        radius = Math.round(radius * Math.sqrt(2));
        d = "m0," + -radius
          + "l" + radius + ",0"
          + " 0," + radius
          + " " + -radius + ",0"
          + "x";
        break;
      }
      case "square": {
        d = "m" + -radius + "," + -radius
          + "l" + radius + "," + -radius
          + " " + radius + "," + radius
          + " " + -radius + "," + radius
          + "x";
        break;
      }
      case "tick": {
        d = "m0,0l0," + -Math.round(s.size);
        break;
      }
      default: { // circle
        d = "ar-" + radius + ",-" + radius + "," + radius + "," + radius + ",0,0,0,0x";
        break;
      }
    }

    e = this.expect("v:group", e);
    var vml = {root: e};
    vml.root.appendChild(vml.shape = this.create("v:shape"));
    vml.shape.appendChild(vml.path = this.create("v:path"));
    vml.shape.appendChild(vml.fill = this.create("v:fill"));
    vml.shape.appendChild(vml.stroke = this.create("v:stroke"));

    var parent = scenes.parent[scenes.parentIndex];

    /*
     * This total awkwardness is because VML rotates around what it perceives to
     * be the center axis of the shape. The rotation is applied to a containing
     * group, and then I use offsets to undo the cludge.
     */

    /* root + shape */
    var a = s.angle;
    if (a) {
      var x = s.left, y = s.top;
      vml.shape.style.left = Math.cos(-a) * x - Math.sin(-a) * y;
      vml.shape.style.top = Math.sin(-a) * x + Math.cos(-a) * y;
      vml.root.style.left = -parent.width / 2;
      vml.root.style.top = -parent.height / 2;
      vml.root.style.rotation = 180 * a / Math.PI;
      vml.shape.style.marginLeft = parent.width / 2;
      vml.shape.style.marginTop = parent.height / 2;
    } else {
      vml.root.style.rotation = "";
      vml.shape.style.left = s.left;
      vml.shape.style.top = s.top;
    }

    vml.root.style.width = parent.width;
    vml.root.style.height = parent.height;
    vml.shape.style.width = parent.width;
    vml.shape.style.height = parent.height;
    vml.shape.style.cursor = s.cursor;
    vml.shape.title = s.title || "";

    /* path */
    vml.path.v = d;

    vml.fill.color = fill.color;
    vml.fill.opacity = fill.opacity;

    vml.stroke.color = stroke.color;
    vml.stroke.opacity = stroke.opacity * Math.min(s.lineWidth, 1);
    vml.stroke.weight = s.lineWidth + "px";

    e = this.append(e, scenes, i);
  }
  return e;
};