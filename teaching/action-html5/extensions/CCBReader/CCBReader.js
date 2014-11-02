/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

var CCB_VERSION = 5;

var CCB_PROPTYPE_POSITION = 0;
var CCB_PROPTYPE_SIZE = 1;
var CCB_PROPTYPE_POINT = 2;
var CCB_PROPTYPE_POINTLOCK = 3;
var CCB_PROPTYPE_SCALELOCK = 4;
var CCB_PROPTYPE_DEGREES = 5;
var CCB_PROPTYPE_INTEGER = 6;
var CCB_PROPTYPE_FLOAT = 7;
var CCB_PROPTYPE_FLOATVAR = 8;
var CCB_PROPTYPE_CHECK = 9;
var CCB_PROPTYPE_SPRITEFRAME = 10;
var CCB_PROPTYPE_TEXTURE = 11;
var CCB_PROPTYPE_BYTE = 12;
var CCB_PROPTYPE_COLOR3 = 13;
var CCB_PROPTYPE_COLOR4VAR = 14;
var CCB_PROPTYPE_FLIP = 15;
var CCB_PROPTYPE_BLENDMODE = 16;
var CCB_PROPTYPE_FNTFILE = 17;
var CCB_PROPTYPE_TEXT = 18;
var CCB_PROPTYPE_FONTTTF = 19;
var CCB_PROPTYPE_INTEGERLABELED = 20;
var CCB_PROPTYPE_BLOCK = 21;
var CCB_PROPTYPE_ANIMATION = 22;
var CCB_PROPTYPE_CCBFILE = 23;
var CCB_PROPTYPE_STRING = 24;
var CCB_PROPTYPE_BLOCKCCCONTROL = 25;
var CCB_PROPTYPE_FLOATSCALE = 26;
var CCB_PROPTYPE_FLOATXY = 27;

var CCB_FLOAT0 = 0;
var CCB_FLOAT1 = 1;
var CCB_FLOAT_MINUS1 = 2;
var CCB_FLOAT05 = 3;
var CCB_FLOAT_INTEGER = 4;
var CCB_FLOAT_FULL = 5;

var CCB_PLATFORM_ALL = 0;
var CCB_PLATFORM_IOS = 1;
var CCB_PLATFORM_MAC = 2;

var CCB_TARGETTYPE_NONE = 0;
var CCB_TARGETTYPE_DOCUMENTROOT = 1;
var CCB_TARGETTYPE_OWNER = 2;

var CCB_KEYFRAME_EASING_INSTANT = 0;
var CCB_KEYFRAME_EASING_LINEAR = 1;
var CCB_KEYFRAME_EASING_CUBIC_IN = 2;
var CCB_KEYFRAME_EASING_CUBIC_OUT = 3;
var CCB_KEYFRAME_EASING_CUBIC_INOUT = 4;
var CCB_KEYFRAME_EASING_ELASTIC_IN = 5;
var CCB_KEYFRAME_EASING_ELASTIC_OUT = 6;
var CCB_KEYFRAME_EASING_ELASTIC_INOUT = 7;
var CCB_KEYFRAME_EASING_BOUNCE_IN = 8;
var CCB_KEYFRAME_EASING_BOUNCE_OUT = 9;
var CCB_KEYFRAME_EASING_BOUNCE_INOUT = 10;
var CCB_KEYFRAME_EASING_BACK_IN = 11;
var CCB_KEYFRAME_EASING_BACK_OUT = 12;
var CCB_KEYFRAME_EASING_BACK_INOUT = 13;

var CCB_POSITIONTYPE_RELATIVE_BOTTOM_LEFT = 0;
var CCB_POSITIONTYPE_RELATIVE_TOP_LEFT = 1;
var CCB_POSITIONTYPE_RELATIVE_TOP_RIGHT = 2;
var CCB_POSITIONTYPE_RELATIVE_BOTTOM_RIGHT = 3;
var CCB_POSITIONTYPE_PERCENT = 4;
var CCB_POSITIONTYPE_MULTIPLY_RESOLUTION = 5;

var CCB_SIZETYPE_ABSOLUTE = 0;
var CCB_SIZETYPE_PERCENT = 1;
var CCB_SIZETYPE_RELATIVE_CONTAINER = 2;
var CCB_SIZETYPE_HORIZONTAL_PERCENT = 3;
var CCB_SIZETYPE_VERTICAL_PERCENT = 4;
var CCB_SIZETYPE_MULTIPLY_RESOLUTION = 5;

var CCB_SCALETYPE_ABSOLUTE = 0;
var CCB_SCALETYPE_MULTIPLY_RESOLUTION = 1;

var _ccbGlobalContext = _ccbGlobalContext || window;

cc.BuilderFile = cc.Node.extend({
    _ccbFileNode:null,

    getCCBFileNode:function () {
        return this._ccbFileNode;
    },
    setCCBFileNode:function (node) {
        this._ccbFileNode = node;
    }
});

cc.BuilderFile.create = function () {
    return new cc.BuilderFile();
};

/**
 * Parse CCBI file which is generated by CocosBuilder
 */
cc.BuilderReader = cc.Class.extend({
    _jsControlled:false,
    _data:null,
    _ccbRootPath:"",

    _bytes:0,
    _currentByte:0,
    _currentBit:0,

    _stringCache:null,
    _loadedSpriteSheets:null,

    _owner:null,
    _animationManager:null,
    _animationManagers:null,
    _animatedProps:null,

    _ccNodeLoaderLibrary:null,
    _ccNodeLoaderListener:null,
    _ccbMemberVariableAssigner:null,
    _ccbSelectorResolver:null,

    _ownerOutletNames:null,
    _ownerOutletNodes:null,
    _nodesWithAnimationManagers:null,
    _animationManagerForNodes:null,

    _ownerCallbackNames:null,
    _ownerCallbackNodes:null,

    _readNodeGraphFromData:false,

    ctor:function (ccNodeLoaderLibrary, ccbMemberVariableAssigner, ccbSelectorResolver, ccNodeLoaderListener) {
        this._stringCache = [];
        this._loadedSpriteSheets = [];
        this._currentBit = -1;
        this._currentByte = -1;

        if (arguments.length != 0) {
            if (ccNodeLoaderLibrary instanceof cc.BuilderReader) {
                var ccbReader = ccNodeLoaderLibrary;

                /* Borrow data from the 'parent' CCBReader. */
                this._loadedSpriteSheets = ccbReader._loadedSpriteSheets;
                this._ccNodeLoaderLibrary = ccbReader._ccNodeLoaderLibrary;

                this._ccbMemberVariableAssigner = ccbReader._ccbMemberVariableAssigner;
                this._ccbSelectorResolver = ccbReader._ccbSelectorResolver;
                this._ccNodeLoaderListener = ccbReader._ccNodeLoaderListener;

                this._ownerCallbackNames = ccbReader._ownerCallbackNames;
                this._ownerCallbackNodes = ccbReader._ownerCallbackNodes;
                this._ownerOutletNames = ccbReader._ownerOutletNames;
                this._ownerOutletNodes = ccbReader._ownerOutletNodes;
                this._ccbRootPath = ccbReader._ccbRootPath;
            } else {
                this._ccNodeLoaderLibrary = ccNodeLoaderLibrary;
                this._ccbMemberVariableAssigner = ccbMemberVariableAssigner;
                this._ccbSelectorResolver = ccbSelectorResolver;
                this._ccNodeLoaderListener = ccNodeLoaderListener;
            }
        }
    },

    getCCBRootPath:function () {
        return this._ccbRootPath;
    },

    setCCBRootPath:function (rootPath) {
        this._ccbRootPath = rootPath;
    },

    initWithData:function (data, owner) {
        //setup action manager
        this._animationManager = new cc.BuilderAnimationManager();

        //setup byte array
        //Array replace to CCData in Javascript
        this._data = data;
        this._bytes = data.length;
        this._currentBit = 0;
        this._currentByte = 0;

        this._owner = owner;

        //setup resolution scale and container size
        this._animationManager.setRootContainerSize(cc.Director.getInstance().getWinSize());

        return true;
    },

    readNodeGraphFromFile:function (ccbFileName, owner, parentSize, animationManager) {
        if (parentSize == null) {
            parentSize = cc.Director.getInstance().getWinSize();
        } else if (parentSize instanceof  cc.BuilderAnimationManager) {
            animationManager = parentSize;
            parentSize = cc.Director.getInstance().getWinSize();
        }
        var fileUtils = cc.FileUtils.getInstance();
        var path = fileUtils.fullPathFromRelativePath(ccbFileName);
        var data = fileUtils.getByteArrayFromFile(path);

        return this.readNodeGraphFromData(data, owner, parentSize, animationManager);
    },

    readNodeGraphFromData:function (data, owner, parentSize) {
        this.initWithData(data, owner);
        var locAnimationManager = this._animationManager;
        locAnimationManager.setRootContainerSize(parentSize);
        locAnimationManager.setOwner(owner);

        this._ownerOutletNames = [];
        this._ownerOutletNodes = [];
        this._ownerCallbackNames = [];
        this._ownerCallbackNodes = [];
        this._animationManagers = new cc._Dictionary();

        var nodeGraph = this.readFileWithCleanUp(true);

        if (nodeGraph && locAnimationManager.getAutoPlaySequenceId() != -1) {
            //auto play animations
            locAnimationManager.runAnimations(locAnimationManager.getAutoPlaySequenceId(), 0);
        }

        if (this._jsControlled) {
            var locNodes = [];
            var locAnimations = [];

            var locAnimationManagers = this._animationManagers;
            var getAllKeys = locAnimationManagers.allKeys();
            for (var i = 0; i < getAllKeys.length; i++) {
                locNodes.push(getAllKeys[i]);
                locAnimations.push(locAnimationManagers.objectForKey(getAllKeys[i]));
            }

            this._nodesWithAnimationManagers = locNodes;
            this._animationManagerForNodes = locAnimations;
        }

        return nodeGraph;
    },

    createSceneWithNodeGraphFromFile:function (ccbFileName, owner, parentSize, animationManager) {
        var node = this.readNodeGraphFromFile(ccbFileName, owner, parentSize, animationManager);
        var scene = cc.Scene.create();
        scene.addChild(node);
        return scene;
    },

    getCCBMemberVariableAssigner:function () {
        return this._ccbMemberVariableAssigner;
    },

    getCCBSelectorResolver:function () {
        return this._ccbSelectorResolver;
    },

    getAnimationManager:function () {
        return this._animationManager;
    },

    setAnimationManager:function (animationManager) {
        this._animationManager = animationManager;
    },

    getAnimatedProperties:function () {
        return this._animatedProps;
    },

    getLoadedSpriteSheet:function () {
        return this._loadedSpriteSheets;
    },

    getOwner:function () {
        return this._owner;
    },

    readInt:function (signed) {
        var numBits = 0;
        while (!this._getBit()) {
            numBits++;
        }

        var current = 0;
        for (var a = numBits - 1; a >= 0; a--) {
            if (this._getBit()) {
                current |= 1 << a;
            }
        }
        current |= 1 << numBits;

        var num;
        if (signed) {
            var s = current % 2;
            if (s) {
                num = 0 | (current / 2);
            } else {
                num = 0 | (-current / 2);
            }
        } else {
            num = current - 1;
        }

        this._alignBits();

        return num;
    },

    readByte:function () {
        var byteValue = this._data[this._currentByte];
        this._currentByte++;
        return byteValue;
    },

    readBool:function () {
        return (0 != this.readByte());
    },

    readFloat:function () {
        var type = this.readByte();

        switch (type) {
            case CCB_FLOAT0:
                return 0;
            case CCB_FLOAT1:
                return 1;
            case CCB_FLOAT_MINUS1:
                return -1;
            case CCB_FLOAT05:
                return 0.5;
            case CCB_FLOAT_INTEGER:
                return this.readInt(true);
            default:
                /* using a memcpy since the compiler isn't
                 * doing the float ptr math correctly on device.
                 */
                var pF = this._decodeFloat(23, 8); //this._bytes + this._currentByte;
                //this._currentByte += 4;
                return pF;
        }
    },

    _decodeFloat:function (precisionBits, exponentBits) {
        var length = precisionBits + exponentBits + 1;
        var size = length >> 3;
        this._checkSize(length);

        var bias = Math.pow(2, exponentBits - 1) - 1;
        var signal = this._readBitsOnly(precisionBits + exponentBits, 1, size);
        var exponent = this._readBitsOnly(precisionBits, exponentBits, size);
        var significand = 0;
        var divisor = 2;
        var curByte = 0; //length + (-precisionBits >> 3) - 1;
        do {
            var byteValue = this._readByteOnly(++curByte, size);
            var startBit = precisionBits % 8 || 8;
            var mask = 1 << startBit;
            while (mask >>= 1) {
                if (byteValue & mask) {
                    significand += 1 / divisor;
                }
                divisor *= 2;
            }
        } while (precisionBits -= startBit);

        this._currentByte += size;

        return exponent == (bias << 1) + 1 ? significand ? NaN : signal ? -Infinity : +Infinity
            : (1 + signal * -2) * (exponent || significand ? !exponent ? Math.pow(2, -bias + 1) * significand
            : Math.pow(2, exponent - bias) * (1 + significand) : 0);
    },

    _readBitsOnly:function (start, length, size) {
        var offsetLeft = (start + length) % 8;
        var offsetRight = start % 8;
        var curByte = size - (start >> 3) - 1;
        var lastByte = size + (-(start + length) >> 3);
        var diff = curByte - lastByte;

        var sum = (this._readByteOnly(curByte, size) >> offsetRight) & ((1 << (diff ? 8 - offsetRight : length)) - 1);

        if (diff && offsetLeft) {
            sum += (this._readByteOnly(lastByte++, size) & ((1 << offsetLeft) - 1)) << (diff-- << 3) - offsetRight;
        }

        while (diff) {
            sum += this._shl(this._readByteOnly(lastByte++, size), (diff-- << 3) - offsetRight);
        }

        return sum;
    },

    _readByteOnly:function (i, size) {
        return this._data[this._currentByte + size - i - 1];
    },

    _shl:function (a, b) {
        for (++b; --b; a = ((a %= 0x7fffffff + 1) & 0x40000000) == 0x40000000 ? a * 2 : (a - 0x40000000) * 2 + 0x7fffffff + 1);
        return a;
    },

    _checkSize:function (neededBits) {
        if (!(this._currentByte + Math.ceil(neededBits / 8) < this._data.length)) {
            throw new Error("Index out of bound");
        }
    },

    readCachedString:function () {
        return this._stringCache[this.readInt(false)];
    },

    isJSControlled:function () {
        return this._jsControlled;
    },

    getOwnerCallbackNames:function () {
        return this._ownerCallbackNames;
    },

    getOwnerCallbackNodes:function () {
        return this._ownerCallbackNodes;
    },

    getOwnerOutletNames:function () {
        return this._ownerOutletNames;
    },

    getOwnerOutletNodes:function () {
        return this._ownerOutletNodes;
    },

    getNodesWithAnimationManagers:function () {
        return this._nodesWithAnimationManagers;
    },

    getAnimationManagersForNodes:function () {
        return this._animationManagerForNodes;
    },

    getAnimationManagers:function () {
        return this._animationManagers;
    },

    setAnimationManagers:function (animationManagers) {
        this._animationManagers = animationManagers;
    },

    addOwnerCallbackName:function (name) {
        this._ownerCallbackNames.push(name)
    },

    addOwnerCallbackNode:function (node) {
        this._ownerCallbackNodes.push(node);
    },

    addDocumentCallbackName:function (name) {
        this._animationManager.addDocumentCallbackName(name);
    },

    addDocumentCallbackNode:function (node) {
        this._animationManager.addDocumentCallbackNode(node);
    },

    addDocumentCallbackControlEvents:function(controlEvents){
        this._animationManager.addDocumentCallbackControlEvents(controlEvents);
    },

    readFileWithCleanUp:function (cleanUp) {
        if (!this._readHeader())
            return null;
        if (!this._readStringCache())
            return null;
        if (!this._readSequences())
            return null;

        var node = this._readNodeGraph();
        this._animationManagers.setObject(this._animationManager, node);

        if (cleanUp)
            this._cleanUpNodeGraph(node);
        return node;
    },

    addOwnerOutletName: function(name){
         this._ownerOutletNames.push(name);
    },

    addOwnerOutletNode: function(node){
         if(node == null)
            return;

        this._ownerOutletNodes.push(node);
    },

    _cleanUpNodeGraph:function (node) {
        node.setUserObject(null);
        var getChildren = node.getChildren();
        for (var i = 0, len = getChildren.length; i < len; i++) {
            this._cleanUpNodeGraph(getChildren[i]);
        }
    },

    _readCallbackKeyframesForSeq:function(seq) {
        var numKeyframes = this.readInt(false);

        if (!numKeyframes)
            return true;

        var channel = new cc.BuilderSequenceProperty();
        var locJsControlled = this._jsControlled, locAnimationManager = this._animationManager, locKeyframes = channel.getKeyframes();
        for (var i = 0; i < numKeyframes; i++) {
            var time = this.readFloat();
            var callbackName = this.readCachedString();
            var callbackType = this.readInt(false);

            var value = [ callbackName, callbackType];

            var keyframe = new cc.BuilderKeyframe();
            keyframe.setTime(time);
            keyframe.setValue(value);

            if(locJsControlled)
                locAnimationManager.getKeyframeCallbacks().push(callbackType+":"+callbackName);

            locKeyframes.push(keyframe);
        }

        // Assign to sequence
        seq.setCallbackChannel(channel);

        return true;
    },

    _readSoundKeyframesForSeq:function(seq) {
        var numKeyframes = this.readInt(false);

        if (!numKeyframes)
            return true;

        var channel = new cc.BuilderSequenceProperty();
        var locKeyframes = channel.getKeyframes();
        for (var i = 0; i < numKeyframes; i++) {
            var time = this.readFloat();
            var soundFile = this.readCachedString();
            var pitch = this.readFloat();
            var pan = this.readFloat();
            var gain = this.readFloat();

            var value  = [soundFile, pitch, pan, gain];
            var keyframe = new cc.BuilderKeyframe();
            keyframe.setTime(time);
            keyframe.setValue(value);

            locKeyframes.push(keyframe);
        }

        // Assign to sequence
        seq.setSoundChannel(channel);
        return true;
    },
    _readSequences:function () {
        var sequences = this._animationManager.getSequences();
        var numSeqs = this.readInt(false);
        for (var i = 0; i < numSeqs; i++) {
            var seq = new cc.BuilderSequence();
            seq.setDuration(this.readFloat());
            seq.setName(this.readCachedString());
            seq.setSequenceId(this.readInt(false));
            seq.setChainedSequenceId(this.readInt(true));

            if (!this._readCallbackKeyframesForSeq(seq))
                return false;
            if (!this._readSoundKeyframesForSeq(seq))
                return false;

            sequences.push(seq);
        }
        this._animationManager.setAutoPlaySequenceId(this.readInt(true));
        return true;
    },

    readKeyframe:function (type) {
        var keyframe = new cc.BuilderKeyframe();
        keyframe.setTime(this.readFloat());
        var easingType = this.readInt(false);
        var easingOpt = 0;
        var value = null;

        if (easingType === CCB_KEYFRAME_EASING_CUBIC_IN
            || easingType === CCB_KEYFRAME_EASING_CUBIC_OUT
            || easingType === CCB_KEYFRAME_EASING_CUBIC_INOUT
            || easingType === CCB_KEYFRAME_EASING_ELASTIC_IN
            || easingType === CCB_KEYFRAME_EASING_ELASTIC_OUT
            || easingType === CCB_KEYFRAME_EASING_ELASTIC_INOUT) {
            easingOpt = this.readFloat();
        }

        keyframe.setEasingType(easingType);
        keyframe.setEasingOpt(easingOpt);

        if (type == CCB_PROPTYPE_CHECK) {
            value = this.readBool();
        } else if (type == CCB_PROPTYPE_BYTE) {
            value = this.readByte();
        } else if (type == CCB_PROPTYPE_COLOR3) {
            var c = cc.c3(this.readByte(), this.readByte(), this.readByte());
            value = cc.Color3BWapper.create(c);
        } else if (type == CCB_PROPTYPE_FLOATXY) {
            value = [this.readFloat(), this.readFloat()];
        } else if (type == CCB_PROPTYPE_DEGREES) {
            value = this.readFloat();
        } else if (type == CCB_PROPTYPE_SCALELOCK || type == CCB_PROPTYPE_POSITION || type == CCB_PROPTYPE_FLOATXY) {
            value = [this.readFloat(), this.readFloat()];
        } else if (type == CCB_PROPTYPE_SPRITEFRAME) {
            var spriteSheet = this.readCachedString();
            var spriteFile = this.readCachedString();

            if (spriteSheet == "") {
                spriteFile = this._ccbRootPath + spriteFile;
                var texture = cc.TextureCache.getInstance().addImage(spriteFile);
                var locContentSize = texture.getContentSize();
                var bounds = cc.rect(0, 0, locContentSize.width, locContentSize.height);
                value = cc.SpriteFrame.createWithTexture(texture, bounds);
            } else {
                spriteSheet = this._ccbRootPath + spriteSheet;
                var frameCache = cc.SpriteFrameCache.getInstance();
                // Load the sprite sheet only if it is not loaded
                if (this._loadedSpriteSheets.indexOf(spriteSheet) == -1) {
                    frameCache.addSpriteFrames(spriteSheet);
                    this._loadedSpriteSheets.push(spriteSheet);
                }
                value = frameCache.getSpriteFrame(spriteFile);
            }
        }
        keyframe.setValue(value);
        return keyframe;
    },

    _readHeader:function () {
        /* If no bytes loaded, don't crash about it. */
        if (this._data == null) {
            return false;
        }

        /* Read magic bytes */
        var magicBytes = this._readStringFromBytes(this._currentByte, 4, true);
        this._currentByte += 4;

        if (magicBytes != 'ccbi') {
            return false;
        }

        /* Read version. */
        var version = this.readInt(false);
        if (version != CCB_VERSION) {
            cc.log("WARNING! Incompatible ccbi file version (file: " + version + " reader: " + CCB_VERSION + ")");
            return false;
        }

        this._jsControlled = this.readBool();
        this._animationManager._jsControlled = this._jsControlled;
        // no need to set if it is "jscontrolled". It is obvious.
        return true;
    },

    _readStringFromBytes:function (startIndex, strLen, reverse) {
        reverse = reverse || false;
        var strValue = "";
        var i, locData = this._data, locCurrentByte = this._currentByte;
        if (reverse) {
            for (i = strLen - 1; i >= 0; i--)
                strValue += String.fromCharCode(locData[locCurrentByte + i]);
        } else {
            for (i = 0; i < strLen; i++)
                strValue += String.fromCharCode(locData[locCurrentByte + i]);
        }
        return strValue;
    },

    _readStringCache:function () {
        var numStrings = this.readInt(false);
        for (var i = 0; i < numStrings; i++)
            this._readStringCacheEntry();
        return true;
    },

    _readStringCacheEntry:function () {
        var b0 = this.readByte();
        var b1 = this.readByte();

        var numBytes = b0 << 8 | b1;

        var str = "", locData = this._data, locCurrentByte = this._currentByte;
        for (var i = 0; i < numBytes; i++) {
            var hexChar = locData[locCurrentByte + i].toString("16").toUpperCase();
            hexChar = hexChar.length > 1 ? hexChar : "0" + hexChar;
            str += "%" + hexChar;
        }
        str = decodeURIComponent(str);

        this._currentByte += numBytes;
        this._stringCache.push(str);
    },

    _readNodeGraph:function (parent) {
        /* Read class name. */
        var className = this.readCachedString();

        var jsControlledName, locJsControlled = this._jsControlled, locActionManager = this._animationManager;
        if (locJsControlled)
            jsControlledName = this.readCachedString();

        var memberVarAssignmentType = this.readInt(false);
        var memberVarAssignmentName;
        if (memberVarAssignmentType != CCB_TARGETTYPE_NONE) {
            memberVarAssignmentName = this.readCachedString();
        }

        var ccNodeLoader = this._ccNodeLoaderLibrary.getCCNodeLoader(className);
        if (!ccNodeLoader) {
            ccNodeLoader = this._ccNodeLoaderLibrary.getCCNodeLoader("CCNode");
            //cc.log("no corresponding node loader for" + className);
            //return null;
        }
        var node = ccNodeLoader.loadCCNode(parent, this);

        //set root node
        if (!locActionManager.getRootNode())
            locActionManager.setRootNode(node);

        if (locJsControlled && node == locActionManager.getRootNode()) {
            locActionManager.setDocumentControllerName(jsControlledName);
        }

        //read animated properties
        var seqs = new cc._Dictionary();
        this._animatedProps = [];

        var i, locAnimatedProps = this._animatedProps;
        var numSequence = this.readInt(false);
        for (i = 0; i < numSequence; ++i) {
            var seqId = this.readInt(false);
            var seqNodeProps = new cc._Dictionary();

            var numProps = this.readInt(false);

            for (var j = 0; j < numProps; ++j) {
                var seqProp = new cc.BuilderSequenceProperty();
                seqProp.setName(this.readCachedString());
                seqProp.setType(this.readInt(false));

                locAnimatedProps.push(seqProp.getName());
                var numKeyframes = this.readInt(false);
                var locKeyframes = seqProp.getKeyframes();
                for (var k = 0; k < numKeyframes; ++k) {
                    var keyFrame = this.readKeyframe(seqProp.getType());
                    locKeyframes.push(keyFrame);
                }
                seqNodeProps.setObject(seqProp, seqProp.getName());
            }
            seqs.setObject(seqNodeProps, seqId);
        }

        if (seqs.count() > 0)
            locActionManager.addNode(node, seqs);

        //read properties
        ccNodeLoader.parseProperties(node, parent, this);

        //handle sub ccb files(remove middle node)
        var isCCBFileNode = node instanceof cc.BuilderFile;
        if (isCCBFileNode) {
            var embeddedNode = node.getCCBFileNode();
            embeddedNode.setPosition(node.getPosition());
            embeddedNode.setRotation(node.getRotation());
            embeddedNode.setScaleX(node.getScaleX());
            embeddedNode.setScaleY(node.getScaleY());
            embeddedNode.setTag(node.getTag());
            embeddedNode.setVisible(true);
            //embeddedNode.ignoreAnchorPointForPosition(node.isIgnoreAnchorPointForPosition());

            locActionManager.moveAnimationsFromNode(node, embeddedNode);
            node.setCCBFileNode(null);
            node = embeddedNode;
        }
        var target = null, locMemberAssigner = null;
        if (memberVarAssignmentType != CCB_TARGETTYPE_NONE) {
            if (!locJsControlled) {
                if (memberVarAssignmentType === CCB_TARGETTYPE_DOCUMENTROOT) {
                    target = locActionManager.getRootNode();
                } else if (memberVarAssignmentType === CCB_TARGETTYPE_OWNER) {
                    target = this._owner;
                }

                if (target != null) {
                    var assigned = false;

                    if (target != null && (target.onAssignCCBMemberVariable)) {
                        assigned = target.onAssignCCBMemberVariable(target, memberVarAssignmentName, node);
                    }
                    locMemberAssigner = this._ccbMemberVariableAssigner;
                    if (!assigned && locMemberAssigner != null && locMemberAssigner.onAssignCCBMemberVariable) {
                        locMemberAssigner.onAssignCCBMemberVariable(target, memberVarAssignmentName, node);
                    }
                }
            } else {
                if (memberVarAssignmentType == CCB_TARGETTYPE_DOCUMENTROOT) {
                    locActionManager.addDocumentOutletName(memberVarAssignmentName);
                    locActionManager.addDocumentOutletNode(node);
                } else {
                    this._ownerOutletNames.push(memberVarAssignmentName);
                    this._ownerOutletNodes.push(node);
                }
            }
        }

        // Assign custom properties.
        if (ccNodeLoader.getCustomProperties().length > 0) {
            var customAssigned = false;
            if(!locJsControlled) {
                target = node;
                if(target != null && target.onAssignCCBCustomProperty != null) {
                    var customProperties = ccNodeLoader.getCustomProperties();
                    var customPropKeys = customProperties.allKeys();
                    for(i = 0;i < customPropKeys.length;i++){
                        var customPropValue = customProperties.objectForKey(customPropKeys[i]);
                        customAssigned = target.onAssignCCBCustomProperty(target, customPropKeys[i], customPropValue);
                        locMemberAssigner = this._ccbMemberVariableAssigner;
                        if(!customAssigned && (locMemberAssigner != null) && (locMemberAssigner.onAssignCCBCustomProperty != null))
                            customAssigned = locMemberAssigner.onAssignCCBCustomProperty(target, customPropKeys[i], customPropValue);
                    }
                }
            }
        }

        this._animatedProps = null;

        /* Read and add children. */
        var numChildren = this.readInt(false);
        for (i = 0; i < numChildren; i++) {
            var child = this._readNodeGraph(node);
            node.addChild(child);
        }

        // FIX ISSUE #1860: "onNodeLoaded will be called twice if ccb was added as a CCBFile".
        // If it's a sub-ccb node, skip notification to CCNodeLoaderListener since it will be
        // notified at LINE #734: CCNode * child = this->readNodeGraph(node);
        if (!isCCBFileNode) {
            // Call onNodeLoaded
            if (node != null && node.onNodeLoaded)
                node.onNodeLoaded(node, ccNodeLoader);
            else if (this._ccNodeLoaderListener != null)
                this._ccNodeLoaderListener.onNodeLoaded(node, ccNodeLoader);
        }

        return node;
    },

    _getBit:function () {
        var bit = (this._data[this._currentByte] & (1 << this._currentBit)) != 0;

        this._currentBit++;

        if (this._currentBit >= 8) {
            this._currentBit = 0;
            this._currentByte++;
        }

        return bit;
    },

    _alignBits:function () {
        if (this._currentBit) {
            this._currentBit = 0;
            this._currentByte++;
        }
    },

    _readUTF8:function () {
    }
});

cc.BuilderReader._ccbResolutionScale = 1;
cc.BuilderReader.setResolutionScale = function(scale){
    cc.BuilderReader._ccbResolutionScale = scale;
};

cc.BuilderReader.getResolutionScale = function () {
    return cc.BuilderReader._ccbResolutionScale;
};

cc.BuilderReader.loadAsScene = function (ccbFilePath, owner, parentSize, ccbRootPath) {
    ccbRootPath = ccbRootPath || cc.BuilderReader.getResourcePath();

    var getNode = cc.BuilderReader.load(ccbFilePath, owner, parentSize, ccbRootPath);

    var scene = cc.Scene.create();
    scene.addChild(getNode);
    return scene;
};

cc.BuilderReader.load = function (ccbFilePath, owner, parentSize, ccbRootPath) {
    ccbRootPath = ccbRootPath || cc.BuilderReader.getResourcePath();
    var reader = new cc.BuilderReader(cc.NodeLoaderLibrary.newDefaultCCNodeLoaderLibrary());
    reader.setCCBRootPath(ccbRootPath);
    if((ccbFilePath.length < 5)||(ccbFilePath.toLowerCase().lastIndexOf(".ccbi") != ccbFilePath.length - 5))
        ccbFilePath = ccbFilePath + ".ccbi";

    var node = reader.readNodeGraphFromFile(ccbFilePath, owner, parentSize);
    var i;
    var callbackName, callbackNode, callbackControlEvents, outletName, outletNode;
    // Assign owner callbacks & member variables
    if (owner) {
        // Callbacks
        var ownerCallbackNames = reader.getOwnerCallbackNames();
        var ownerCallbackNodes = reader.getOwnerCallbackNodes();
        for (i = 0; i < ownerCallbackNames.length; i++) {
            callbackName = ownerCallbackNames[i];
            callbackNode = ownerCallbackNodes[i];
            if(callbackNode instanceof cc.ControlButton)
                callbackNode.addTargetWithActionForControlEvents(owner, owner[callbackName], 255);        //register all type of events
            else
                callbackNode.setCallback(owner[callbackName], owner);
        }

        // Variables
        var ownerOutletNames = reader.getOwnerOutletNames();
        var ownerOutletNodes = reader.getOwnerOutletNodes();
        for (i = 0; i < ownerOutletNames.length; i++) {
            outletName = ownerOutletNames[i];
            outletNode = ownerOutletNodes[i];
            owner[outletName] = outletNode;
        }
    }

    var nodesWithAnimationManagers = reader.getNodesWithAnimationManagers();
    var animationManagersForNodes = reader.getAnimationManagersForNodes();
    if(!nodesWithAnimationManagers || !animationManagersForNodes)
        return node;
    // Attach animation managers to nodes and assign root node callbacks and member variables
    for (i = 0; i < nodesWithAnimationManagers.length; i++) {
        var innerNode = nodesWithAnimationManagers[i];
        var animationManager = animationManagersForNodes[i];

        var j;
        innerNode.animationManager = animationManager;

        var documentControllerName = animationManager.getDocumentControllerName();
        if (!documentControllerName) continue;

        // Create a document controller
        var controller;
        if(documentControllerName.indexOf(".") > -1){
            var controllerNameArr = documentControllerName.split(".");
            controller = _ccbGlobalContext[controllerNameArr[0]];
            for(var ni = 1, niLen = controllerNameArr.length - 1; ni < niLen; ni++)
                controller = controller[controllerNameArr[ni]];
            controller = new controller[controllerNameArr[controllerNameArr.length - 1]]();
        }else
            controller = new _ccbGlobalContext[documentControllerName]();
        controller.controllerName = documentControllerName;

        innerNode.controller = controller;
        controller.rootNode = innerNode;

        // Callbacks
        var documentCallbackNames = animationManager.getDocumentCallbackNames();
        var documentCallbackNodes = animationManager.getDocumentCallbackNodes();
        var documentCallbackControlEvents = animationManager.getDocumentCallbackControlEvents();
        for (j = 0; j < documentCallbackNames.length; j++) {
            callbackName = documentCallbackNames[j];
            callbackNode = documentCallbackNodes[j];
            callbackControlEvents = documentCallbackControlEvents[j];
            if(callbackNode instanceof cc.ControlButton)
                callbackNode.addTargetWithActionForControlEvents(controller, controller[callbackName], callbackControlEvents);        //register all type of events
            else
                callbackNode.setCallback(controller[callbackName], controller);
        }

        // Variables
        var documentOutletNames = animationManager.getDocumentOutletNames();
        var documentOutletNodes = animationManager.getDocumentOutletNodes();
        for (j = 0; j < documentOutletNames.length; j++) {
            outletName = documentOutletNames[j];
            outletNode = documentOutletNodes[j];

            controller[outletName] = outletNode;
        }

        if (controller.onDidLoadFromCCB && typeof(controller.onDidLoadFromCCB) == "function")
            controller.onDidLoadFromCCB();

        // Setup timeline callbacks
        var keyframeCallbacks = animationManager.getKeyframeCallbacks();
        for (j = 0; j < keyframeCallbacks.length; j++) {
            var callbackSplit = keyframeCallbacks[j].split(":");
            var callbackType = callbackSplit[0];
            var kfCallbackName = callbackSplit[1];

            if (callbackType == 1){ // Document callback
                animationManager.setCallFunc(cc.CallFunc.create(controller[kfCallbackName], controller), keyframeCallbacks[j]);
            } else if (callbackType == 2 && owner) {// Owner callback
                animationManager.setCallFunc(cc.CallFunc.create(owner[kfCallbackName], owner), keyframeCallbacks[j]);
            }
        }
    }

    return node;
};

cc.BuilderReader._resourcePath = "";
cc.BuilderReader.setResourcePath = function (rootPath) {
    cc.BuilderReader._resourcePath = rootPath;
};

cc.BuilderReader.getResourcePath = function () {
    return cc.BuilderReader._resourcePath;
};

cc.BuilderReader.lastPathComponent = function (pathStr) {
    var slashPos = pathStr.lastIndexOf("/");
    if (slashPos != -1) {
        return pathStr.substring(slashPos + 1, pathStr.length - slashPos);
    }
    return pathStr;
};

cc.BuilderReader.deletePathExtension = function (pathStr) {
    var dotPos = pathStr.lastIndexOf(".");
    if (dotPos != -1) {
        return pathStr.substring(0, dotPos);
    }
    return pathStr;
};

cc.BuilderReader.toLowerCase = function (sourceStr) {
    return sourceStr.toLowerCase();
};

cc.BuilderReader.endsWith = function (sourceStr, ending) {
    if (sourceStr.length >= ending.length)
        return (sourceStr.lastIndexOf(ending) == 0);
    else
        return false;
};

cc.BuilderReader.concat = function (stringA, stringB) {
    return stringA + stringB;
};

