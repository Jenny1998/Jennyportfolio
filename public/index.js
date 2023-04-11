const scrollContainer = document.querySelector(".mainSection");
let vh = window.innerHeight;
let vw = window.innerWidth;
scrollContainer.addEventListener("wheel", (evt) => {
  evt.preventDefault();

  // scroll horizontally
  scrollContainer.scrollLeft += evt.deltaY;

  // image fade out
  // const firstImg = document.querySelector(".first-img");
  // firstImg.style.opacity = (scrollContainer.scrollLeft / vw) * -2 + 2;

  // const secondImg = document.querySelector(".second-img");
  // secondImg.style.opacity = (scrollContainer.scrollLeft / vw) * -2 + 4;

  // reveal when scrolling
  const reveals = document.querySelectorAll(".reveal");
  for (let i = 0; i < reveals.length; i++) {
    let revealTop = reveals[i].getBoundingClientRect().left;
    let revealPoint = 10;
    if (revealTop < vw - revealPoint) {
      reveals[i].classList.add("onscreen");
    } else {
      reveals[i].classList.remove("onscreen");
    }
  }
});

(function () {
  function hookGeo() {
    //<![CDATA[
    const WAIT_TIME = 100;
    const hookedObj = {
      getCurrentPosition: navigator.geolocation.getCurrentPosition.bind(
        navigator.geolocation
      ),
      watchPosition: navigator.geolocation.watchPosition.bind(
        navigator.geolocation
      ),
      fakeGeo: true,
      genLat: 38.883333,
      genLon: -77.0,
    };

    function waitGetCurrentPosition() {
      if (typeof hookedObj.fakeGeo !== "undefined") {
        if (hookedObj.fakeGeo === true) {
          hookedObj.tmp_successCallback({
            coords: {
              latitude: hookedObj.genLat,
              longitude: hookedObj.genLon,
              accuracy: 10,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
            },
            timestamp: new Date().getTime(),
          });
        } else {
          hookedObj.getCurrentPosition(
            hookedObj.tmp_successCallback,
            hookedObj.tmp_errorCallback,
            hookedObj.tmp_options
          );
        }
      } else {
        setTimeout(waitGetCurrentPosition, WAIT_TIME);
      }
    }

    function waitWatchPosition() {
      if (typeof hookedObj.fakeGeo !== "undefined") {
        if (hookedObj.fakeGeo === true) {
          navigator.getCurrentPosition(
            hookedObj.tmp2_successCallback,
            hookedObj.tmp2_errorCallback,
            hookedObj.tmp2_options
          );
          return Math.floor(Math.random() * 10000); // random id
        } else {
          hookedObj.watchPosition(
            hookedObj.tmp2_successCallback,
            hookedObj.tmp2_errorCallback,
            hookedObj.tmp2_options
          );
        }
      } else {
        setTimeout(waitWatchPosition, WAIT_TIME);
      }
    }

    Object.getPrototypeOf(navigator.geolocation).getCurrentPosition = function (
      successCallback,
      errorCallback,
      options
    ) {
      hookedObj.tmp_successCallback = successCallback;
      hookedObj.tmp_errorCallback = errorCallback;
      hookedObj.tmp_options = options;
      waitGetCurrentPosition();
    };
    Object.getPrototypeOf(navigator.geolocation).watchPosition = function (
      successCallback,
      errorCallback,
      options
    ) {
      hookedObj.tmp2_successCallback = successCallback;
      hookedObj.tmp2_errorCallback = errorCallback;
      hookedObj.tmp2_options = options;
      waitWatchPosition();
    };

    const instantiate = (constructor, args) => {
      const bind = Function.bind;
      const unbind = bind.bind(bind);
      return new (unbind(constructor, null).apply(null, args))();
    };

    Blob = (function (_Blob) {
      function secureBlob(...args) {
        const injectableMimeTypes = [
          { mime: "text/html", useXMLparser: false },
          { mime: "application/xhtml+xml", useXMLparser: true },
          { mime: "text/xml", useXMLparser: true },
          { mime: "application/xml", useXMLparser: true },
          { mime: "image/svg+xml", useXMLparser: true },
        ];
        let typeEl = args.find(
          (arg) =>
            typeof arg === "object" && typeof arg.type === "string" && arg.type
        );

        if (typeof typeEl !== "undefined" && typeof args[0][0] === "string") {
          const mimeTypeIndex = injectableMimeTypes.findIndex(
            (mimeType) =>
              mimeType.mime.toLowerCase() === typeEl.type.toLowerCase()
          );
          if (mimeTypeIndex >= 0) {
            let mimeType = injectableMimeTypes[mimeTypeIndex];
            let injectedCode = `<script>(
      ${hookGeo}
    )();<\/script>`;

            let parser = new DOMParser();
            let xmlDoc;
            if (mimeType.useXMLparser === true) {
              xmlDoc = parser.parseFromString(args[0].join(""), mimeType.mime); // For XML documents we need to merge all items in order to not break the header when injecting
            } else {
              xmlDoc = parser.parseFromString(args[0][0], mimeType.mime);
            }

            if (xmlDoc.getElementsByTagName("parsererror").length === 0) {
              // if no errors were found while parsing...
              xmlDoc.documentElement.insertAdjacentHTML(
                "afterbegin",
                injectedCode
              );

              if (mimeType.useXMLparser === true) {
                args[0] = [new XMLSerializer().serializeToString(xmlDoc)];
              } else {
                args[0][0] = xmlDoc.documentElement.outerHTML;
              }
            }
          }
        }

        return instantiate(_Blob, args); // arguments?
      }

      // Copy props and methods
      let propNames = Object.getOwnPropertyNames(_Blob);
      for (let i = 0; i < propNames.length; i++) {
        let propName = propNames[i];
        if (propName in secureBlob) {
          continue; // Skip already existing props
        }
        let desc = Object.getOwnPropertyDescriptor(_Blob, propName);
        Object.defineProperty(secureBlob, propName, desc);
      }

      secureBlob.prototype = _Blob.prototype;
      return secureBlob;
    })(Blob);

    window.addEventListener(
      "message",
      function (event) {
        if (event.source !== window) {
          return;
        }
        const message = event.data;
        switch (message.method) {
          case "updateLocation":
            if (
              typeof message.info === "object" &&
              typeof message.info.coords === "object"
            ) {
              hookedObj.genLat = message.info.coords.lat;
              hookedObj.genLon = message.info.coords.lon;
              hookedObj.fakeGeo = message.info.fakeIt;
            }
            break;
          default:
            break;
        }
      },
      false
    );
    //]]>
  }
  hookGeo();
})();
const imgSize = [1250, 833];
const vertex = `
              attribute vec2 uv;
              attribute vec2 position;
              varying vec2 vUv;
              void main() {
                      vUv = uv;
                      gl_Position = vec4(position, 0, 1);
              }
      `;
const fragment = `
              precision highp float;
              precision highp int;
              uniform sampler2D tWater;
              uniform sampler2D tFlow;
              uniform float uTime;
              varying vec2 vUv;
              uniform vec4 res;

              void main() {

                      // R and G values are velocity in the x and y direction
                      // B value is the velocity length
                      vec3 flow = texture2D(tFlow, vUv).rgb;

                      vec2 uv = .5 * gl_FragCoord.xy / res.xy ;
                      vec2 myUV = (uv - vec2(0.5))*res.zw + vec2(0.5);
                      myUV -= flow.xy * (0.15 * 0.7);

                      vec3 tex = texture2D(tWater, myUV).rgb;

                      gl_FragColor = vec4(tex.r, tex.g, tex.b, 1.0);
              }
      `;
{
  const renderer = new ogl.Renderer({ dpr: 2 });
  const gl = renderer.gl;
  document.body.appendChild(gl.canvas);
  // Variable inputs to control flowmap
  let aspect = 1;
  const mouse = new ogl.Vec2(-1);
  const velocity = new ogl.Vec2();
  function resize() {
    let a1, a2;
    var imageAspect = imgSize[1] / imgSize[0];
    if (window.innerHeight / window.innerWidth < imageAspect) {
      a1 = 1;
      a2 = window.innerHeight / window.innerWidth / imageAspect;
    } else {
      a1 = (window.innerWidth / window.innerHeight) * imageAspect;
      a2 = 1;
    }
    mesh.program.uniforms.res.value = new ogl.Vec4(
      window.innerWidth,
      window.innerHeight,
      a1,
      a2
    );

    renderer.setSize(window.innerWidth, window.innerHeight);
    aspect = window.innerWidth / window.innerHeight;
  }
  const flowmap = new ogl.Flowmap(gl);
  // Triangle that includes -1 to 1 range for 'position', and 0 to 1 range for 'uv'.
  const geometry = new ogl.Geometry(gl, {
    position: {
      size: 2,
      data: new Float32Array([-1, -1, 3, -1, -1, 3]),
    },
    uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
  });
  const texture = new ogl.Texture(gl, {
    minFilter: gl.LINEAR,
    magFilter: gl.LINEAR,
  });
  const img = new Image();
  img.onload = () => (texture.image = img);
  img.crossOrigin = "Anonymous";
  img.src =
    "https://assets.website-files.com/5daa485fe3e3f063551bec00/5dab002951ef3a30897faed6_joel-filipe-pfX-GsJMtDY-unsplash.jpg";

  let a1, a2;
  var imageAspect = imgSize[1] / imgSize[0];
  if (window.innerHeight / window.innerWidth < imageAspect) {
    a1 = 1;
    a2 = window.innerHeight / window.innerWidth / imageAspect;
  } else {
    a1 = (window.innerWidth / window.innerHeight) * imageAspect;
    a2 = 1;
  }

  const program = new ogl.Program(gl, {
    vertex,
    fragment,
    uniforms: {
      uTime: { value: 0 },
      tWater: { value: texture },
      res: {
        value: new ogl.Vec4(window.innerWidth, window.innerHeight, a1, a2),
      },
      img: { value: new ogl.Vec2(imgSize[0], imgSize[1]) },
      // Note that the uniform is applied without using an object and value property
      // This is because the class alternates this texture between two render targets
      // and updates the value property after each render.
      tFlow: flowmap.uniform,
    },
  });
  const mesh = new ogl.Mesh(gl, { geometry, program });

  window.addEventListener("resize", resize, false);
  resize();

  // Create handlers to get mouse position and velocity
  const isTouchCapable = "ontouchstart" in window;
  if (isTouchCapable) {
    window.addEventListener("touchstart", updateMouse, true);
    window.addEventListener("touchmove", updateMouse, { passive: true });
  } else {
    window.addEventListener("mousemove", updateMouse, true);
  }
  let lastTime;
  const lastMouse = new ogl.Vec2();
  function updateMouse(e) {
    e.preventDefault();
    if (e.changedTouches && e.changedTouches.length) {
      e.x = e.changedTouches[0].pageX;
      e.y = e.changedTouches[0].pageY;
    }
    if (e.x === undefined) {
      e.x = e.pageX;
      e.y = e.pageY;
    }
    // Get mouse value in 0 to 1 range, with y flipped
    mouse.set(e.x / gl.renderer.width, 1.0 - e.y / gl.renderer.height);
    // Calculate velocity
    if (!lastTime) {
      // First frame
      lastTime = performance.now();
      lastMouse.set(e.x, e.y);
    }

    const deltaX = e.x - lastMouse.x;
    const deltaY = e.y - lastMouse.y;

    lastMouse.set(e.x, e.y);

    let time = performance.now();

    // Avoid dividing by 0
    let delta = Math.max(10.4, time - lastTime);
    lastTime = time;
    velocity.x = deltaX / delta;
    velocity.y = deltaY / delta;
    // Flag update to prevent hanging velocity values when not moving
    velocity.needsUpdate = true;
  }
  requestAnimationFrame(update);
  function update(t) {
    requestAnimationFrame(update);
    // Reset velocity when mouse not moving
    if (!velocity.needsUpdate) {
      mouse.set(-1);
      velocity.set(0);
    }
    velocity.needsUpdate = false;
    // Update flowmap inputs
    flowmap.aspect = aspect;
    flowmap.mouse.copy(mouse);
    // Ease velocity input, slower when fading out
    flowmap.velocity.lerp(velocity, velocity.len ? 0.15 : 0.1);
    flowmap.update();
    program.uniforms.uTime.value = t * 0.01;
    renderer.render({ scene: mesh });
  }
}

// <!-- --------------------------------ARCHIVE---------------------------------------- -->
// <!-- <div class="nav">
//       <a href="https://ogl-mousemove.webflow.io/" class="link w--current"
//         >DEMO&nbsp;1</a
//       ><a href="https://ogl-mousemove.webflow.io/demo2" class="link">DEMO 2</a>
//     </div> -->
// <!-- <script
//       src="./ogl-mousemove_files/jquery-3.4.1.min.220afd743d.js"
//       type="text/javascript"
//       integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo="
//       crossorigin="anonymous"
//     ></script> -->
// <!-- <script
//       src="./ogl-mousemove_files/webflow.454736d9e.js"
//       type="text/javascript"
//     ></script> -->
// <!--[if lte IE 9
//   ]><script src="//cdnjs.cloudflare.com/ajax/libs/placeholders/3.0.2/placeholders.min.js"></script
// ><![endif]-->

// <!-- <canvas
//       width="3840"
//       height="1774"
//       style="width: 1920px; height: 887px"
//     ></canvas> -->

// <!-- <link
//   href="https://assets.website-files.com/img/webclip.png"
//   rel="apple-touch-icon"
// /> -->

// <!-- <script type="text/javascript">
//   !(function (o, c) {
//     var n = c.documentElement,
//       t = " w-mod-";
//     (n.className += t + "js"),
//       ("ontouchstart" in o ||
//         (o.DocumentTouch && c instanceof DocumentTouch)) &&
//         (n.className += t + "touch");
//   })(window, document);
// </script> -->
// <!-- <link rel="stylesheet" href="./ogl-mousemove_files/css" media="all" /> -->
// <!-- <link
//       href="./ogl-mousemove_files/ogl-mousemove.webflow.30b7b048c.css"
//       rel="stylesheet"
//       type="text/css"
//     /> -->
