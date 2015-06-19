var JSTACK = {};

JSTACK.Keystone = jasmine.createSpyObj("Keystone", ["init", "authenticate", "gettenants", "params", "getservice"]);
JSTACK.Nova = jasmine.createSpyObj("Nova", ["deleteimage", "getimagelist", "params"]);
JSTACK.Glance = jasmine.createSpyObj("Glance", ["updateimage"]);
JSTACK.Comm = jasmine.createSpyObj("Comm",  ["getEndpoint", "del"]);