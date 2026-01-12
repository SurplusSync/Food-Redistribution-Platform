"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDonationDto = void 0;
var swagger_1 = require("@nestjs/swagger");
var class_validator_1 = require("class-validator");
var CreateDonationDto = function () {
    var _a;
    var _foodType_decorators;
    var _foodType_initializers = [];
    var _foodType_extraInitializers = [];
    var _quantity_decorators;
    var _quantity_initializers = [];
    var _quantity_extraInitializers = [];
    var _unit_decorators;
    var _unit_initializers = [];
    var _unit_extraInitializers = [];
    var _preparationTime_decorators;
    var _preparationTime_initializers = [];
    var _preparationTime_extraInitializers = [];
    var _latitude_decorators;
    var _latitude_initializers = [];
    var _latitude_extraInitializers = [];
    var _longitude_decorators;
    var _longitude_initializers = [];
    var _longitude_extraInitializers = [];
    var _address_decorators;
    var _address_initializers = [];
    var _address_extraInitializers = [];
    var _imageUrl_decorators;
    var _imageUrl_initializers = [];
    var _imageUrl_extraInitializers = [];
    var _specialInstructions_decorators;
    var _specialInstructions_initializers = [];
    var _specialInstructions_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateDonationDto() {
                this.foodType = __runInitializers(this, _foodType_initializers, void 0);
                this.quantity = (__runInitializers(this, _foodType_extraInitializers), __runInitializers(this, _quantity_initializers, void 0));
                this.unit = (__runInitializers(this, _quantity_extraInitializers), __runInitializers(this, _unit_initializers, void 0));
                this.preparationTime = (__runInitializers(this, _unit_extraInitializers), __runInitializers(this, _preparationTime_initializers, void 0));
                this.latitude = (__runInitializers(this, _preparationTime_extraInitializers), __runInitializers(this, _latitude_initializers, void 0));
                this.longitude = (__runInitializers(this, _latitude_extraInitializers), __runInitializers(this, _longitude_initializers, void 0));
                this.address = (__runInitializers(this, _longitude_extraInitializers), __runInitializers(this, _address_initializers, void 0));
                this.imageUrl = (__runInitializers(this, _address_extraInitializers), __runInitializers(this, _imageUrl_initializers, void 0));
                this.specialInstructions = (__runInitializers(this, _imageUrl_extraInitializers), __runInitializers(this, _specialInstructions_initializers, void 0));
                __runInitializers(this, _specialInstructions_extraInitializers);
            }
            return CreateDonationDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _foodType_decorators = [(0, swagger_1.ApiProperty)({ example: 'Vegetable Biryani' }), (0, class_validator_1.IsString)()];
            _quantity_decorators = [(0, swagger_1.ApiProperty)({ example: 50 }), (0, class_validator_1.IsNumber)(), (0, class_validator_1.Min)(1)];
            _unit_decorators = [(0, swagger_1.ApiProperty)({ example: 'servings' }), (0, class_validator_1.IsString)()];
            _preparationTime_decorators = [(0, swagger_1.ApiProperty)({ example: '2025-01-12T10:00:00Z' }), (0, class_validator_1.IsDateString)()];
            _latitude_decorators = [(0, swagger_1.ApiProperty)({ example: 17.6868 }), (0, class_validator_1.IsNumber)()];
            _longitude_decorators = [(0, swagger_1.ApiProperty)({ example: 83.2185 }), (0, class_validator_1.IsNumber)()];
            _address_decorators = [(0, swagger_1.ApiProperty)({ required: false, example: 'Beach Road, Visakhapatnam' }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _imageUrl_decorators = [(0, swagger_1.ApiProperty)({ required: false }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _specialInstructions_decorators = [(0, swagger_1.ApiProperty)({ required: false }), (0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            __esDecorate(null, null, _foodType_decorators, { kind: "field", name: "foodType", static: false, private: false, access: { has: function (obj) { return "foodType" in obj; }, get: function (obj) { return obj.foodType; }, set: function (obj, value) { obj.foodType = value; } }, metadata: _metadata }, _foodType_initializers, _foodType_extraInitializers);
            __esDecorate(null, null, _quantity_decorators, { kind: "field", name: "quantity", static: false, private: false, access: { has: function (obj) { return "quantity" in obj; }, get: function (obj) { return obj.quantity; }, set: function (obj, value) { obj.quantity = value; } }, metadata: _metadata }, _quantity_initializers, _quantity_extraInitializers);
            __esDecorate(null, null, _unit_decorators, { kind: "field", name: "unit", static: false, private: false, access: { has: function (obj) { return "unit" in obj; }, get: function (obj) { return obj.unit; }, set: function (obj, value) { obj.unit = value; } }, metadata: _metadata }, _unit_initializers, _unit_extraInitializers);
            __esDecorate(null, null, _preparationTime_decorators, { kind: "field", name: "preparationTime", static: false, private: false, access: { has: function (obj) { return "preparationTime" in obj; }, get: function (obj) { return obj.preparationTime; }, set: function (obj, value) { obj.preparationTime = value; } }, metadata: _metadata }, _preparationTime_initializers, _preparationTime_extraInitializers);
            __esDecorate(null, null, _latitude_decorators, { kind: "field", name: "latitude", static: false, private: false, access: { has: function (obj) { return "latitude" in obj; }, get: function (obj) { return obj.latitude; }, set: function (obj, value) { obj.latitude = value; } }, metadata: _metadata }, _latitude_initializers, _latitude_extraInitializers);
            __esDecorate(null, null, _longitude_decorators, { kind: "field", name: "longitude", static: false, private: false, access: { has: function (obj) { return "longitude" in obj; }, get: function (obj) { return obj.longitude; }, set: function (obj, value) { obj.longitude = value; } }, metadata: _metadata }, _longitude_initializers, _longitude_extraInitializers);
            __esDecorate(null, null, _address_decorators, { kind: "field", name: "address", static: false, private: false, access: { has: function (obj) { return "address" in obj; }, get: function (obj) { return obj.address; }, set: function (obj, value) { obj.address = value; } }, metadata: _metadata }, _address_initializers, _address_extraInitializers);
            __esDecorate(null, null, _imageUrl_decorators, { kind: "field", name: "imageUrl", static: false, private: false, access: { has: function (obj) { return "imageUrl" in obj; }, get: function (obj) { return obj.imageUrl; }, set: function (obj, value) { obj.imageUrl = value; } }, metadata: _metadata }, _imageUrl_initializers, _imageUrl_extraInitializers);
            __esDecorate(null, null, _specialInstructions_decorators, { kind: "field", name: "specialInstructions", static: false, private: false, access: { has: function (obj) { return "specialInstructions" in obj; }, get: function (obj) { return obj.specialInstructions; }, set: function (obj, value) { obj.specialInstructions = value; } }, metadata: _metadata }, _specialInstructions_initializers, _specialInstructions_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateDonationDto = CreateDonationDto;
