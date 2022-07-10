import { Component, OnInit } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { GoogleAnalytics } from 'src/app/decorators/ga';

@Component({
  selector: 'app-invitation-modal',
  templateUrl: './invitation-modal.page.html',
  styleUrls: ['./invitation-modal.page.scss'],
})
export class InvitationModalPage implements OnInit {

  inviteCode = '';
  email = '';
  name = '';

  constructor(
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
  }


  cancelPopover() {
    this.modalCtrl.dismiss({ action: { cancel: true } });

  }

  @GoogleAnalytics('contactseller')
  closeForWaitingList() {
    this.modalCtrl.dismiss({ action: { cancel: false, name: this.name, email: this.email, code: '' } });
  }

  closeWithInvitecode() {
    this.modalCtrl.dismiss({ action: { cancel: false, name: '', email: '', code: this.inviteCode } });
  }

}

/*


      //       Already have a code - just enter it below!
      const alert = await this.alertCtrl.create({
        //  cssClass: 'my-custom-class',
        header: 'By Invitation only!!',
        message:
          `Welcome to Kuyua - but sorry, we cannot let you in yet as this is an invitation only service.
          Drop your email address below and we will reach out to you when there is a spot available.<br><br>
          Thanks and see you soon!<br><br>
          `,
        inputs: [
          {
            name: 'code',
            type: 'text',
            placeholder: 'Enter invite code here!'
          },
          {
            name: 'name',
            type: 'text',
            placeholder: 'Your name'
          },
          {
            name: 'email',
            type: 'text',
            placeholder: 'Drop your email here!'
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Confirm Cancel');
            }
          }, {
            text: 'Ok',
            handler: async (data: { name: string, email: string; code: string; }) => {
              console.log('Confirm Ok', data);

              // if we have an invitation code, we continue the flow
              // TODO: we duplicate the invitation code check here


            }
          }
        ]
      });
      await alert.present();
    }

*/
