import { Inject, Injectable, Logger } from '@nestjs/common';
import * as SendgridMail from '@sendgrid/mail';
import { AttachmentJSON } from '@sendgrid/helpers/classes/attachment';
import { EmailData } from '@sendgrid/helpers/classes/email-address';
import { ConfigType } from '@nestjs/config';
import * as fs from 'node:fs';
import * as handlebars from 'handlebars';
import * as path from 'node:path';

import { MAIL_PROVIDER_SERVICE } from './mail.provider';
import { emailConfig } from '../config/email.config';
import { publicUrlConfig } from '../config/publicUrl.config';
import { minioConfig } from '../config/minio.config';
import { MailContent } from '@sendgrid/helpers/classes/mail';

@Injectable()
export class MailService {
  private readonly NO_REPLY: EmailData = {
    email: '',
    name: '',
  };

  private readonly BACKOFFICE: EmailData = {
    email: '',
    name: '',
  };

  private readonly minioSyncFolderUrl: string;
  private readonly publicUrlVar: string;

  private readonly logger = new Logger(MailService.name);

  constructor(
    @Inject(MAIL_PROVIDER_SERVICE)
    private readonly mailService: typeof SendgridMail,
    @Inject(emailConfig.KEY)
    private email: ConfigType<typeof emailConfig>,
    @Inject(publicUrlConfig.KEY)
    private publicUrl: ConfigType<typeof publicUrlConfig>,
    @Inject(minioConfig.KEY)
    private minio: ConfigType<typeof minioConfig>,
  ) {
    this.publicUrlVar = publicUrl.url;
    this.minioSyncFolderUrl = `${minio.publicUrl}/${minio.bucketName}/minioSyncFolder`;
    this.NO_REPLY = {
      email: email.fromNoReply,
      name: email.fromName,
    };

    this.BACKOFFICE = {
      email: email.fromBackoffice,
      name: email.fromName,
    };
  }

  public async sendMail({
    to,
    subject,
    data,
    attachments,
    useHtmlTemplate = false,
    templateId,
    plainText,
    fromBackoffice = false,
  }: {
    to: string;
    subject: string;
    data?: Record<string, any>;
    attachments?: AttachmentJSON[];
    useHtmlTemplate?: boolean;
    templateId?: string;
    plainText?: string;
    fromBackoffice?: boolean;
  }) {
    try {
      const htmlContent =
        useHtmlTemplate && templateId
          ? await this.loadAndRenderTemplate(templateId, data)
          : '';

      const mailOptions: SendgridMail.MailDataRequired =
        this.prepareMailOptions({
          to,
          subject,
          attachments,
          useHtmlTemplate,
          htmlContent,
          plainText,
          data,
          fromBackoffice,
        });

      return this.sendWithSendGrid(mailOptions);
    } catch (error) {
      this.logger.error('Error during sending email:', error);
    }
  }

  private async loadAndRenderTemplate(
    templateId: string,
    data?: Record<string, any>,
  ): Promise<string> {
    try {
      const templatePath = path.resolve(
        '/usr/src/app/dist/resources/templates',
        `${templateId}.html`,
      );
      const templateSource = await fs.promises.readFile(templatePath, 'utf8');
      const template = handlebars.compile(templateSource);
      return template({
        ...data,
        currentYear: new Date().getFullYear(),
        publicLink: this.publicUrlVar,
        logoImageUrl: `${this.minioSyncFolderUrl}/emails/logo.png`,
        youtubeIconUrl: `${this.minioSyncFolderUrl}/emails/youtubeIcon.png`,
        facebookIconUrl: `${this.minioSyncFolderUrl}/emails/facebookIcon.png`,
        telegramIconUrl: `${this.minioSyncFolderUrl}/emails/telegramIcon.png`,
        linkedinIconUrl: `${this.minioSyncFolderUrl}/emails/linkedinIcon.png`,
      });
    } catch (error) {
      this.logger.error('Error reading or rendering the template file:', error);
    }
  }

  private prepareMailOptions({
    to,
    subject,
    attachments,
    useHtmlTemplate,
    htmlContent,
    plainText,
    data,
    fromBackoffice,
  }: {
    to: string;
    subject: string;
    attachments?: AttachmentJSON[];
    useHtmlTemplate: boolean;
    htmlContent: string;
    plainText?: string;
    data?: Record<string, any>;
    fromBackoffice?: boolean;
  }): SendgridMail.MailDataRequired {
    const contentPlain =
      plainText ??
      (useHtmlTemplate
        ? htmlContent.replace(/<[^>]*>?/gm, '')
        : JSON.stringify(data));

    const contentHtml = useHtmlTemplate ? htmlContent : JSON.stringify(data);

    const content = [
      contentPlain ? { type: 'text/plain', value: contentPlain } : undefined,
      contentHtml ? { type: 'text/html', value: contentHtml } : undefined,
    ].filter(Boolean) as MailContent[] & { 0: MailContent };

    return {
      from: fromBackoffice ? this.BACKOFFICE : this.NO_REPLY,
      to,
      subject,
      attachments,
      content,
    };
  }

  /**
   * Email sending approach SendGrid
   *
   * Using SendGrid's v3 Node.js Library:
   * @see https://github.com/sendgrid/sendgrid-nodejs
   *
   * Full documentation here:
   * @see https://sendgrid.com/docs/API_Reference/Web_API_v3/index.html
   */
  private sendWithSendGrid(msg: SendgridMail.MailDataRequired): {
    success: true;
  } {
    process.nextTick(() => {
      this.mailService.send(msg).catch(async (err) => {
        this.logger.error(
          `Письмо не было доставлено: \nОшибка: ${err}\nПочта: ${
            msg.to?.toString() || ''
          }`,
        );
      });
    });

    return { success: true };
  }
}
