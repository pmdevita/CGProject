When rendering object, pass a buffer the 
same size as the texture it uses (maybe already containing the texture?)

If the angle is within the radius, get the uv,
convert to texture pixel coords, draw to the buffer.



idea 1

using gl_FragCoords, write a transform out 
of all zeroes except for the single pair 
of uv coordinates used in the center


