"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveMqModule = void 0;
const active_mq_service_1 = require("./active-mq.service");
class ActiveMqModule {
}
exports.ActiveMqModule = ActiveMqModule;
ActiveMqModule.forRoot = (replyQueueAddress) => {
    return {
        module: ActiveMqModule,
        global: true,
        providers: [
            {
                provide: 'APP_QUEUE',
                useValue: replyQueueAddress,
            },
        ],
        exports: ['APP_QUEUE'],
    };
};
ActiveMqModule.forFeature = (options) => {
    return {
        module: ActiveMqModule,
        providers: [
            {
                provide: 'ACTIVE_MQ_CONFIG',
                useValue: options,
            },
            active_mq_service_1.ActiveMqService,
        ],
        exports: [active_mq_service_1.ActiveMqService],
    };
};
//# sourceMappingURL=active-mq.module.js.map