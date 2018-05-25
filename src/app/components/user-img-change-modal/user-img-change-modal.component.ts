import { Component, OnInit, OnChanges, OnDestroy, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxJs';

import * as Redux from '../../service/redux';
import { ChangeUserImgUrl } from '../../service/redux/UserInfoReducer';
import { bodyScroll, unSubscribe } from '../../service/utils';
import { Network } from '../../service/Network';
import { Account as iAccount } from '../../service/Interface';

@Component({
  selector: 'app-user-img-change-modal',
  templateUrl: './user-img-change-modal.component.html',
  styleUrls: ['./user-img-change-modal.component.scss']
})
export class UserImgChangeModalComponent implements OnInit, OnChanges, OnDestroy {
  @Input() on = false;
  @Output() exit = new EventEmitter<boolean>();

  accountInfo: iAccount = 
    { loggedIn: false, accessToken: undefined, reduxState: 'none' };
  img: string = undefined;

  accountSubc: Subscription;

  constructor(
    private router: Router,
    private network: Network,
    private store: Store<Redux.StoreInfo>
  ) { }

  onFileChange(files: FileList) {
    // console.log(event);
    if (files && files.length > 0) {

      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.img = reader.result;
        // console.log(this.img);
      }
      reader.readAsDataURL(file);

    }

  }

  okBtn(event, files: FileList) {
    if (event) { event.stopPropagation(); }
    
    const form = new FormData();
    form.append('userimg', files[0]);

    // console.log(form.get('userimg'));

    if (this.accountInfo.reduxState === 'done' && this.accountInfo.loggedIn) {
      this.network.changeUserImg(this.accountInfo.accessToken, form)
      .subscribe(result => {
        if (result.result === true) {
  
          // console.log(result.msg);
          // console.log(result.payload);
          this.store.dispatch(new ChangeUserImgUrl(result.payload));
          this.exit.emit(true);
  
        } else {
  
          if (result.code === 1) {
  
            alert(result.msg);
            this.router.navigate(['/']);
            
          }
          console.error(result.msg);
        }
      });
    } else {
      console.error(`로그인 하지 않았어요.`);
    }

  }

  cancelBtn(event) {
    if (event) { event.stopPropagation(); }

    this.exit.emit(true);
  }

  // -----------------------------------------------------------
  // ---- 모달 운영에 관련된 함수들.
  // -----------------------------------------------------------

  ngOnInit() {
    bodyScroll(false);
    this.accountSubc = this.store.select(Redux.getAccount)
    .subscribe(result => {
      if (result.reduxState === 'done') {
        if (result.loggedIn) {
          this.accountInfo = result;
        }
      }
    });
  }

  pause() {
    bodyScroll(true);
    this.img = undefined;
    this.accountInfo = 
      { loggedIn: false, accessToken: undefined, reduxState: 'none'};
    unSubscribe(this.accountSubc);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.on) {
      this.ngOnInit();
    } else {
      this.pause();
    }
  }

  ngOnDestroy() {
    this.pause();
  }

}
