// Generated by LiveScript 1.2.0
(function(){
  var AABB, Comp, Empty, Track, Stroke, IndexedStroke, x$, ref$;
  AABB = (function(){
    AABB.displayName = 'AABB';
    var prototype = AABB.prototype, constructor = AABB;
    function AABB(min, max){
      this.min = min != null
        ? min
        : {
          x: Infinity,
          y: Infinity
        };
      this.max = max != null
        ? max
        : {
          x: -Infinity,
          y: -Infinity
        };
      Object.defineProperty(this, "width", {
        get: function(){
          return this.max.x - this.min.x;
        }
      });
      Object.defineProperty(this, "height", {
        get: function(){
          return this.max.y - this.min.y;
        }
      });
      Object.defineProperty(this, "size", {
        get: function(){
          return this.width * this.height;
        }
      });
    }
    prototype.clone = function(){
      return new AABB(this.min, this.max);
    };
    prototype.addPoint = function(pt){
      if (pt.x < this.min.x) {
        this.min.x = pt.x;
      }
      if (pt.y < this.min.y) {
        this.min.y = pt.y;
      }
      if (pt.x > this.max.x) {
        this.max.x = pt.x;
      }
      if (pt.y > this.max.y) {
        return this.max.y = pt.y;
      }
    };
    prototype.addBox = function(aabb){
      if (aabb.min.x < this.min.x) {
        this.min.x = aabb.min.x;
      }
      if (aabb.min.y < this.min.y) {
        this.min.y = aabb.min.y;
      }
      if (aabb.max.x > this.max.x) {
        this.max.x = aabb.max.x;
      }
      if (aabb.max.y > this.max.y) {
        return this.max.y = aabb.max.y;
      }
    };
    prototype.containPoint = function(pt){
      var ref$;
      return (this.min.x < (ref$ = pt.x) && ref$ < this.max.x) && (this.min.y < (ref$ = pt.y) && ref$ < this.max.y);
    };
    prototype.delta = function(box){
      return new AABB(this.min, box.min).size + new AABB(this.max, box.max).size;
    };
    prototype.render = function(canvas){
      var x$;
      x$ = canvas.getContext('2d');
      x$.strokeStyle = '#f00';
      x$.lineWidth = 10;
      x$.beginPath();
      x$.rect(this.min.x, this.min.y, this.width, this.height);
      x$.stroke();
      return x$;
    };
    return AABB;
  }());
  Comp = (function(){
    Comp.displayName = 'Comp';
    var prototype = Comp.prototype, constructor = Comp;
    function Comp(children, aabb){
      var i$, ref$, len$, child;
      this.children = children != null
        ? children
        : [];
      this.aabb = aabb != null
        ? aabb
        : new AABB;
      for (i$ = 0, len$ = (ref$ = this.children).length; i$ < len$; ++i$) {
        child = ref$[i$];
        child.parent = this;
        this.aabb.addBox(child.aabb);
      }
      this.computeLength();
      this.time = 0.0;
      this.x = this.y = 0;
      this.scaleX = this.scaleY = 1.0;
      this.parent = null;
    }
    prototype.computeLength = function(){
      return this.length = this.children.reduce(function(prev, current){
        return prev + current.length;
      }, 0);
    };
    prototype.childrenChanged = function(){
      var len, i$, ref$, len$, child;
      this.computeLength();
      len = 0;
      for (i$ = 0, len$ = (ref$ = this.children).length; i$ < len$; ++i$) {
        child = ref$[i$];
        len += child.time * child.length;
      }
      this.time = len / this.length;
      if ((ref$ = this.parent) != null) {
        ref$.childrenChanged();
      }
    };
    prototype.breakUp = function(strokeNums){
      var comps, this$ = this;
      strokeNums == null && (strokeNums = []);
      comps = [];
      strokeNums.reduce(function(start, len){
        var end;
        end = start + len;
        comps.push(new Comp(this$.children.slice(start, end)));
        return end;
      }, 0);
      return new Comp(comps);
    };
    prototype.hitTest = function(pt){
      var results;
      results = [];
      if (this.aabb.containPoint(pt)) {
        results.push(this);
      }
      return this.children.reduce(function(prev, child){
        return prev.concat(child.hitTest(pt));
      }, results);
    };
    prototype.beforeRender = function(ctx){};
    prototype.afterRender = function(ctx){};
    prototype.render = function(canvas){
      var x, y, scaleX, scaleY, p, ctx, len, i$, ref$, len$, child;
      x = this.x;
      y = this.y;
      scaleX = this.scaleX;
      scaleY = this.scaleY;
      p = this.parent;
      while (p) {
        x += p.x;
        y += p.y;
        scaleX *= p.scaleX;
        scaleY *= p.scaleY;
        p = p.parent;
      }
      (ctx = canvas.getContext('2d')).setTransform(scaleX, 0, 0, scaleY, x, y);
      this.beforeRender(ctx);
      len = this.length * this.time;
      for (i$ = 0, len$ = (ref$ = this.children).length; i$ < len$; ++i$) {
        child = ref$[i$];
        if (len > 0) {
          if (child.length === 0) {
            continue;
          }
          child.time = Math.min(child.length, len) / child.length;
          child.render(canvas);
          len -= child.length;
        }
      }
      return this.afterRender(ctx);
    };
    return Comp;
  }());
  Empty = (function(superclass){
    var prototype = extend$((import$(Empty, superclass).displayName = 'Empty', Empty), superclass).prototype, constructor = Empty;
    function Empty(data){
      this.data = data;
      Empty.superclass.call(this);
    }
    prototype.computeLength = function(){
      return this.length = this.data.speed * this.data.delay;
    };
    prototype.render = function(){};
    return Empty;
  }(Comp));
  Track = (function(superclass){
    var prototype = extend$((import$(Track, superclass).displayName = 'Track', Track), superclass).prototype, constructor = Track;
    function Track(data, options){
      var ref$;
      this.data = data;
      this.options = options != null
        ? options
        : {};
      (ref$ = this.options).trackWidth || (ref$.trackWidth = 150);
      (ref$ = this.data).size || (ref$.size = this.options.trackWidth);
      Track.superclass.call(this);
    }
    prototype.computeLength = function(){
      return this.length = Math.sqrt(this.data.vector.x * this.data.vector.x + this.data.vector.y * this.data.vector.y);
    };
    prototype.render = function(canvas){
      var x$;
      x$ = canvas.getContext('2d');
      x$.beginPath();
      x$.strokeStyle = '#000';
      x$.fillStyle = '#000';
      x$.lineWidth = 2 * this.data.size;
      x$.lineCap = 'round';
      x$.moveTo(this.data.x, this.data.y);
      x$.lineTo(this.data.x + this.data.vector.x * this.time, this.data.y + this.data.vector.y * this.time);
      x$.stroke();
      return x$;
    };
    return Track;
  }(Comp));
  Stroke = (function(superclass){
    var prototype = extend$((import$(Stroke, superclass).displayName = 'Stroke', Stroke), superclass).prototype, constructor = Stroke;
    function Stroke(data){
      var children, i$, to$, i, prev, current, aabb, ref$, len$, path;
      children = [];
      for (i$ = 1, to$ = data.track.length; i$ < to$; ++i$) {
        i = i$;
        prev = data.track[i - 1];
        current = data.track[i];
        children.push(new Track({
          x: prev.x,
          y: prev.y,
          vector: {
            x: current.x - prev.x,
            y: current.y - prev.y
          },
          size: prev.size
        }));
      }
      this.outline = data.outline;
      aabb = new AABB;
      for (i$ = 0, len$ = (ref$ = this.outline).length; i$ < len$; ++i$) {
        path = ref$[i$];
        if (path.x !== undefined) {
          aabb.addPoint(path);
        }
        if (path.end !== undefined) {
          aabb.addPoint(path.begin);
          aabb.addPoint(path.end);
        }
        if (path.mid !== undefined) {
          aabb.addPoint(path.mid);
        }
      }
      Stroke.superclass.call(this, children, aabb);
    }
    prototype.pathOutline = function(ctx){
      var i$, ref$, len$, path, results$ = [];
      for (i$ = 0, len$ = (ref$ = this.outline).length; i$ < len$; ++i$) {
        path = ref$[i$];
        switch (path.type) {
        case 'M':
          results$.push(ctx.moveTo(path.x, path.y));
          break;
        case 'L':
          results$.push(ctx.lineTo(path.x, path.y));
          break;
        case 'C':
          results$.push(ctx.bezierCurveTo(path.begin.x, path.begin.y, path.mid.x, path.mid.y, path.end.x, path.end.y));
          break;
        case 'Q':
          results$.push(ctx.quadraticCurveTo(path.begin.x, path.begin.y, path.end.x, path.end.y));
        }
      }
      return results$;
    };
    prototype.hitTest = function(pt){
      if (this.aabb.containPoint(pt)) {
        return [this];
      } else {
        return [];
      }
    };
    prototype.beforeRender = function(ctx){
      var x$;
      x$ = ctx;
      x$.save();
      x$.beginPath();
      this.pathOutline(ctx);
      return ctx.clip();
    };
    prototype.afterRender = function(ctx){
      return ctx.restore();
    };
    return Stroke;
  }(Comp));
  IndexedStroke = (function(superclass){
    var prototype = extend$((import$(IndexedStroke, superclass).displayName = 'IndexedStroke', IndexedStroke), superclass).prototype, constructor = IndexedStroke;
    function IndexedStroke(data, index){
      var track, x, y, vx, vy, up, upx, upy;
      this.index = index;
      IndexedStroke.superclass.call(this, data);
      track = this.children[0];
      x = track.data.x;
      y = track.data.y;
      vx = track.data.vector.x / track.length;
      vy = track.data.vector.y / track.length;
      up = Math.atan2(vy, vx);
      up = Math.PI / 2 > up && up >= -Math.PI / 2
        ? up - Math.PI / 2
        : up + Math.PI / 2;
      upx = Math.cos(up);
      upy = Math.sin(up);
      x += track.data.size / 2 * vx;
      x += track.data.size * 2 / 3 * upx;
      y += track.data.size / 2 * vy;
      y += track.data.size * 2 / 3 * upy;
      this.arrow = {
        rear: {
          x: x - 64 * vx,
          y: y - 64 * vy
        },
        tip: {
          x: x + 128 * vx,
          y: y + 128 * vy
        },
        text: {
          x: x + 64 * upx,
          y: y + 64 * upy
        },
        head: {
          x: x + 64 * vx,
          y: y + 64 * vy
        },
        edge: {
          x: x + 64 * vx + 32 * upx,
          y: y + 64 * vy + 32 * upy
        }
      };
    }
    prototype.afterRender = function(ctx){
      var x$;
      superclass.prototype.afterRender.call(this, ctx);
      x$ = ctx;
      x$.strokeStyle = '#c00';
      x$.lineWidth = 12;
      x$.beginPath();
      x$.moveTo(this.arrow.rear.x, this.arrow.rear.y);
      x$.lineTo(this.arrow.tip.x, this.arrow.tip.y);
      x$.stroke();
      x$.fillStyle = '#c00';
      x$.beginPath();
      x$.moveTo(this.arrow.head.x, this.arrow.head.y);
      x$.lineTo(this.arrow.tip.x, this.arrow.tip.y);
      x$.lineTo(this.arrow.edge.x, this.arrow.edge.y);
      x$.fill();
      x$.font = "128px sans-serif";
      x$.textAlign = 'center';
      x$.textBaseline = 'middle';
      x$.fillText(this.index, this.arrow.text.x, this.arrow.text.y);
      return x$;
    };
    return IndexedStroke;
  }(Stroke));
  x$ = (ref$ = window.zhStrokeData) != null
    ? ref$
    : window.zhStrokeData = {};
  x$.Comp = Comp;
  x$.Empty = Empty;
  x$.Track = Track;
  x$.Stroke = Stroke;
  x$.IndexedStroke = IndexedStroke;
  function extend$(sub, sup){
    function fun(){} fun.prototype = (sub.superclass = sup).prototype;
    (sub.prototype = new fun).constructor = sub;
    if (typeof sup.extended == 'function') sup.extended(sub);
    return sub;
  }
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
