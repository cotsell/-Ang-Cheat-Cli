import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { UserInfo } from '../../service/Interface';
import { SERVER_ADDRESS as SA } from '../../service/SysConf';

@Component({
  selector: 'app-signature',
  templateUrl: './signature.component.html',
  styleUrls: ['./signature.component.scss']
})
export class SignatureComponent implements OnInit {
  @Input() userInfo: UserInfo;
  readonly SERVER_ADDRESS = SA;

  constructor(
    private router: Router) { }

  ngOnInit() {
  }

  showUserProfile(event) {
    if (event) { event.stopPropagation(); }

    this.router.navigate(['/profileDetail/' + this.userInfo.id]);
  }

}
