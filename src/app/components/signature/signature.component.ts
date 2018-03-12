import { Component, OnInit, Input } from '@angular/core';

import { UserInfo } from '../../service/Interface';

@Component({
  selector: 'app-signature',
  templateUrl: './signature.component.html',
  styleUrls: ['./signature.component.scss']
})
export class SignatureComponent implements OnInit {
  @Input() userInfo: UserInfo;

  constructor() { }

  ngOnInit() {
  }

}
