const { ReadableStream, WritableStream, TransformStream } = require("stream/web");
const { TextDecoder, TextEncoder } = require("util");
const { MessagePort, MessageChannel } = require("worker_threads");

global.ReadableStream = ReadableStream;
global.WritableStream = WritableStream;
global.TransformStream = TransformStream;
global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;
global.MessagePort = MessagePort;
global.MessageChannel = MessageChannel;

const Enzyme = require("enzyme");
const Adapter = require("enzyme-adapter-react-16");

Enzyme.configure({ adapter: new Adapter() });
