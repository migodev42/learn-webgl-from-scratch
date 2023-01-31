import { radToDeg, degToRad } from './utils.js';

// 模型变换
function modalViewOperation(rotation) {
  const modelViewMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.
  // mat4.translate(
  //   modelViewMatrix, // destination matrix
  //   modelViewMatrix, // matrix to translate
  //   [-0.0, -0.0, -6.0]
  // ); // amount to translate

  // mat4.rotate(
  //   modelViewMatrix, // destination matrix
  //   modelViewMatrix, // matrix to rotate
  //   cubeRotation, // amount to rotate in radians
  //   [0, 0, 1]
  // ); // axis to rotate around (Z)

  // 定义绕 y 轴旋转
  mat4.rotate(
    modelViewMatrix, // destination matrix
    modelViewMatrix, // matrix to rotate
    -rotation * 0.5, // amount to rotate in radians
    [0, 2 * Math.sqrt(6) / 3, 0]
  ); // axis to rotate around (Y)

  return modelViewMatrix;
}

function drawScene(gl, programInfo, buffers, rotation) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
  gl.clearDepth(1.0); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things

  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  // 处理投影
  // https://webglfundamentals.org/webgl/frustum-diagram.html
  const fieldOfView = degToRad(60); // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = .1;
  const zFar = 2000;
  const projectionMatrix = mat4.create();

  mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

  const cameraMatrix = mat4.create();

  // 绕X轴旋转相机
  mat4.fromXRotation(cameraMatrix, degToRad(15));  
  // 向下、先后移动相机
  mat4.translate(cameraMatrix, cameraMatrix, [0, -0.5, 6.0]);

  // 求相机视角矩阵的逆（相机和物体是逆）
  const viewMatrix = mat4.create();
  mat4.invert(viewMatrix, cameraMatrix);

  // 求投影矩阵
  const viewProjectionMatrix = mat4.create();
  mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix);

  // 模型变换矩阵
  const modelViewMatrix = modalViewOperation(rotation);

  // mat4.rotate(
  //   modelViewMatrix, // destination matrix
  //   modelViewMatrix, // matrix to rotate
  //   cubeRotation * 0.3, // amount to rotate in radians
  //   [1, 0, 0]
  // ); // axis to rotate around (X)

  // 定义从缓冲区 buffer 中取数据
  setPositionAttribute(gl, buffers, programInfo);
  setColorAttribute(gl, buffers, programInfo);

  gl.useProgram(programInfo.program);

  
  mat4.translate(viewProjectionMatrix, viewProjectionMatrix, [0, -1, 0.0]);

  // 设置模型变换和投影变换矩阵
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.projectionMatrix,
    false,
    viewProjectionMatrix
  );
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.modelViewMatrix,
    false,
    modelViewMatrix
  );

  gl.drawArrays(gl.TRIANGLES, 0, 3 * 4); // 使用 drawArrays 绘制每个面的顶点都需要绘制一遍，即每个面 3个顶点*4个面

}

// 告诉 WebGL 如何从缓冲区读取数据到 vertexPosition
function setPositionAttribute(gl, buffers, programInfo) {
  const size = 3;
  const type = gl.FLOAT; // the data in the buffer is 32bit floats
  const normalize = false; // don't normalize
  const stride = 0; // how many bytes to get from one set of values to the next
  // 0 = use type and numComponents above
  const offset = 0; // how many bytes inside the buffer to start from
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    size,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}

// 告诉 WebGL 如何从缓冲区读取数据到 vertexColor
function setColorAttribute(gl, buffers, programInfo) {
  const size = 4;
  const type = gl.FLOAT;
  const normalize = false;
  const stride = 0;
  const offset = 0;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexColor,
    size,
    type,
    normalize,
    stride,
    offset
  );
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
}

export { drawScene };