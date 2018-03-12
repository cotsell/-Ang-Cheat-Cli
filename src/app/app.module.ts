import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';


import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { MainComponent } from './views/main/main.component';
import { TitlebarComponent } from './components/titlebar/titlebar.component';
import { DocumentDetailComponent } from './views/document-detail/document-detail.component';
import { TitlebarMenuComponent } from './components/titlebar-menu/titlebar-menu.component';
import { DocumentListComponent } from './views/document-list/document-list.component';
import { DocumentListArticleComponent } from './components/document-list-article/document-list-article.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { TagsComponent } from './components/tags/tags.component';
import { SignatureComponent } from './components/signature/signature.component';

import { Network } from './service/Network';
import { getReducers } from './service/redux';
import Account from './service/Account';
import { ProfileDetailComponent } from './views/profile-detail/profile-detail.component';
import { ReplyListComponent } from './components/reply-list/reply-list.component';
import { ReplyArticleComponent } from './components/reply-article/reply-article.component';

const route: Routes = [
  { path: '', component: MainComponent },
  { path: 'docuDetail/:id', component: DocumentDetailComponent },
  { path: 'docuList/:subject', component: DocumentListComponent },
  { path: 'profileDetail', component: ProfileDetailComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainComponent,
    TitlebarComponent,
    DocumentDetailComponent,
    TitlebarMenuComponent,
    DocumentListComponent,
    DocumentListArticleComponent,
    SearchBarComponent,
    TagsComponent,
    SignatureComponent,
    ProfileDetailComponent,
    ReplyListComponent,
    ReplyArticleComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(route),
    ReactiveFormsModule,
    HttpClientModule,
    StoreModule.forRoot(getReducers()),
    StoreDevtoolsModule.instrument({ maxAge: 25 })
  ],
  providers: [Network, Account],
  bootstrap: [AppComponent]
})
export class AppModule { }
