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
import { TagsComponent } from './components/tags/tags.component';
import { SignatureComponent } from './components/signature/signature.component';

import { Network } from './service/Network';
import { getReducers } from './service/redux';
import { Account } from './service/Account';
import { ProfileDetailComponent } from './views/profile-detail/profile-detail.component';
import { ReplyListComponent } from './components/reply-list/reply-list.component';
import { ReplyArticleComponent } from './components/reply-article/reply-article.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { DocumentEditComponent } from './views/document-edit/document-edit.component';
import { CategoryMakerComponent } from './components/category-maker/category-maker.component';
import { ScrapModalComponent } from './components/scrap-modal/scrap-modal.component';
import { ScrapListModalComponent } from './components/scrap-list-modal/scrap-list-modal.component';
import { DocumentOptionModalComponent } from './components/document-option-modal/document-option-modal.component';
import { UserImgChangeModalComponent } from './components/user-img-change-modal/user-img-change-modal.component';

const route: Routes = [
  { path: '', component: MainComponent },
  // { path: 'writeDocu', component: DocumentEditComponent, data: { writeMode: true }},
  { path: 'writeDocu', component: DocumentEditComponent },
  { path: 'writeDocu/:relatedId', component: DocumentEditComponent },
  { path: 'writeDocu/:documentId/edit', component: DocumentEditComponent },
  { path: 'docuDetail/:id', component: DocumentDetailComponent },
  { path: 'docuList', component: DocumentListComponent,
    data: [{ userDocu: false }] },
  { path: 'docuList/userDocu', component: DocumentListComponent,
    data: [{ userDocu: true }] },
  { path: 'profileDetail', component: ProfileDetailComponent },
  { path: 'profileDetail/:id', component: ProfileDetailComponent }
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
    TagsComponent,
    SignatureComponent,
    ProfileDetailComponent,
    ReplyListComponent,
    ReplyArticleComponent,
    PaginationComponent,
    DocumentEditComponent,
    CategoryMakerComponent,
    ScrapModalComponent,
    ScrapListModalComponent,
    DocumentOptionModalComponent,
    UserImgChangeModalComponent
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
