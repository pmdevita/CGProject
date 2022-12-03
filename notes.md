When rendering object, pass a buffer the 
same size as the texture it uses (maybe already containing the texture?)

If the angle is within the radius, get the uv,
convert to texture pixel coords, draw to the buffer.

