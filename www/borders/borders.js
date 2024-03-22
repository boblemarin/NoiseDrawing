var d,s,e=document,b=e.body;

// top left
d = e.createElement("div");
s = d.style;
s.backgroundImage = "url('borders/tl.png')";
s.display = "block";
s.position = "absolute";
s.left = "0px";
s.top = "0px";
s.width = "11px";
s.height = "326px";
b.appendChild(d);

d = e.createElement("div");
s = d.style;
s.backgroundImage = "url('borders/tl.png')";
s.display = "block";
s.position = "absolute";
s.left = "0px";
s.top = "0px";
s.width = "285px";
s.height = "11px";
b.appendChild(d);

// top right
d = e.createElement("div");
s = d.style;
s.backgroundImage = "url('borders/tr.png')";
s.display = "block";
s.position = "absolute";
s.right = "0px";
s.top = "0px";
s.width = "286px";
s.height = "11px";
b.appendChild(d);

d = e.createElement("div");
s = d.style;
s.backgroundImage = "url('borders/tr.png')";
s.backgroundPosition = "-274px 1px";
s.display = "block";
s.position = "absolute";
s.right = "0px";
s.top = "0px";
s.width = "11px";
s.height = "166px";
b.appendChild(d);

// bottom left
d = e.createElement("div");
s = d.style;
s.backgroundImage = "url('borders/bl.png')";
s.display = "block";
s.position = "absolute";
s.left = "0px";
s.bottom = "0px";
s.width = "11px";
s.height = "324px";
b.appendChild(d);

d = e.createElement("div");
s = d.style;
s.backgroundImage = "url('borders/bl.png')";
s.backgroundPosition = "0px -315px";
s.display = "block";
s.position = "absolute";
s.left = "0px";
s.bottom = "0px";
s.width = "254px";
s.height = "9px";
b.appendChild(d);

// bottom right
d = document.createElement("div");
s = d.style;
s.backgroundImage = "url('borders/br.png')";
s.backgroundPosition = "-241px 0px"
s.display = "block";
s.position = "absolute";
s.right = "0px";
s.bottom = "0px";
s.width = "11px";
s.height = "169px";
document.body.appendChild(d);

d = document.createElement("div");
s = d.style;
s.backgroundImage = "url('borders/br.png')";
s.backgroundPosition = "0px -161px"
s.display = "block";
s.position = "absolute";
s.right = "0px";
s.bottom = "0px";
s.width = "252px";
s.height = "8px";
document.body.appendChild(d);