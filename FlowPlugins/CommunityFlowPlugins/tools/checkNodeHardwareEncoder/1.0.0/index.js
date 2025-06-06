"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.plugin = exports.details = void 0;
var hardwareUtils_1 = require("../../../../FlowHelpers/1.0.0/hardwareUtils");
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
var details = function () { return ({
    name: 'Check Node Hardware Encoder',
    description: "\n  Check if node hardware encoder is available. Can also be used to check for specific hardware.\n  For example:\n\n  HEVC encoders:\n  hevc_nvenc = Nvidia\n  hevc_amf = AMD\n  hevc_vaapi = Intel\n  hevc_qsv = Intel\n  hevc_videotoolbox = Apple\n  \n  AV1 encoders:\n  av1_nvenc = Nvidia\n  av1_amf = AMD\n  av1_vaapi = Intel\n  av1_qsv = Intel\n  av1_videotoolbox = Apple\n  ",
    style: {
        borderColor: 'orange',
    },
    tags: '',
    isStartPlugin: false,
    pType: '',
    requiresVersion: '2.11.01',
    sidebarPosition: -1,
    icon: 'faQuestion',
    inputs: [
        {
            label: 'Hardware Encoder',
            name: 'hardwareEncoder',
            type: 'string',
            defaultValue: 'hevc_nvenc',
            inputUI: {
                type: 'dropdown',
                options: [
                    'hevc_nvenc',
                    'hevc_amf',
                    'hevc_rkmpp',
                    'hevc_vaapi',
                    'hevc_qsv',
                    'hevc_videotoolbox',
                    'av1_nvenc',
                    'av1_amf',
                    'av1_vaapi',
                    'av1_qsv',
                    'av1_videotoolbox',
                ],
            },
            tooltip: 'Specify hardware (based on encoder) to check for',
        },
    ],
    outputs: [
        {
            number: 1,
            tooltip: 'Node has hardware',
        },
        {
            number: 2,
            tooltip: 'Node does not have hardware',
        },
    ],
}); };
exports.details = details;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var plugin = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var lib, hardwareEncoder, encoderString, targetCodec, encoderProperties, nodeHasHardware;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                lib = require('../../../../../methods/lib')();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-param-reassign
                args.inputs = lib.loadDefaultValues(args.inputs, details);
                hardwareEncoder = args.inputs.hardwareEncoder;
                encoderString = String(hardwareEncoder);
                targetCodec = encoderString.startsWith('av1_') ? 'av1' : 'hevc';
                return [4 /*yield*/, (0, hardwareUtils_1.getEncoder)({
                        targetCodec: targetCodec,
                        hardwareEncoding: true,
                        hardwareType: 'auto',
                        args: args,
                    })];
            case 1:
                encoderProperties = _a.sent();
                nodeHasHardware = encoderProperties.enabledDevices.some(function (row) { return row.encoder === encoderString; });
                args.jobLog("Node has hardwareEncoder ".concat(encoderString, ": ").concat(nodeHasHardware));
                return [2 /*return*/, {
                        outputFileObj: args.inputFileObj,
                        outputNumber: nodeHasHardware ? 1 : 2,
                        variables: args.variables,
                    }];
        }
    });
}); };
exports.plugin = plugin;
