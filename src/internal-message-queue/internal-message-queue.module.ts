import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SQSClient } from '@aws-sdk/client-sqs';
import { ShippingDataConsumer } from './shipping-data-consumer';
import * as process from 'process';
import { InternalMessageQueueService } from './internal-message-queue.service';

@Module({
  imports: [
    SqsModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const consumers = [
          {
            attributeNames: ['All'],
            messageAttributeNames: ['All'],
            name: process.env.AWS_SQS_QUEUE_SHIPPING,
            queueUrl: `${process.env.AWS_SQS_PREFIX}/${process.env.AWS_SQS_QUEUE_SHIPPING}`,
            sqs: new SQSClient({
              endpoint: new URL(process.env.AWS_SQS_PREFIX).origin,
              region: process.env.AWS_SQS_REGION,
            }),
          },
        ];

        const producers = [
          {
            attributeNames: ['All'],
            messageAttributeNames: ['All'],
            name: process.env.AWS_SQS_QUEUE_EMAIL,
            queueUrl: `${process.env.AWS_SQS_PREFIX}/${process.env.AWS_SQS_QUEUE_EMAIL}`,
            sqs: new SQSClient({
              endpoint: new URL(process.env.AWS_SQS_PREFIX).origin,
              region: process.env.AWS_SQS_REGION,
            }),
          },
        ];

        return {
          consumers: consumers,
          producers: producers,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [ShippingDataConsumer, InternalMessageQueueService],
})
export class InternalMessageQueueModule {}
