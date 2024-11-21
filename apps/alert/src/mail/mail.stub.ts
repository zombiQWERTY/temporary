import { MailData } from '@sendgrid/helpers/classes/mail';
import * as SendgridMail from '@sendgrid/mail';

export class MailStub {
  public async send(
    message: MailData,
  ): Promise<[SendgridMail.ClientResponse, any]> {
    const clientResponse = {
      body: {
        content: 'Почта отправлена в консоль',
        data: message.content,
        attachments: message.attachments?.map((a) => a.filename),
      },
      statusCode: 301,
      headers: [],
    };

    console.dir(clientResponse, { depth: 10 });

    return Promise.resolve([clientResponse, {}]);
  }
}
