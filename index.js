"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const platform_1 = require("@effect/platform");
const platform_node_1 = require("@effect/platform-node");
const effect_1 = require("effect");
const node_http_1 = require("node:http");
// Define our API with one group named "Greetings" and one endpoint called "hello-world"
const MyApi = platform_1.HttpApi.make("MyApi").add(platform_1.HttpApiGroup.make("Greetings").add(platform_1.HttpApiEndpoint.get("hello-world") `/`.addSuccess(effect_1.Schema.String)));
// Implement the "Greetings" group
const GreetingsLive = platform_1.HttpApiBuilder.group(MyApi, "Greetings", (handlers) => handlers.handle("hello-world", () => effect_1.Effect.succeed("Hello, World!")));
// Provide the implementation for the API
const MyApiLive = platform_1.HttpApiBuilder.api(MyApi).pipe(effect_1.Layer.provide(GreetingsLive));
// Set up the server using NodeHttpServer on port 3000
const ServerLive = platform_1.HttpApiBuilder.serve().pipe(effect_1.Layer.provide(MyApiLive), effect_1.Layer.provide(platform_node_1.NodeHttpServer.layer(node_http_1.createServer, { port: 3000 })));
// Launch the server
effect_1.Layer.launch(ServerLive).pipe(platform_node_1.NodeRuntime.runMain);
