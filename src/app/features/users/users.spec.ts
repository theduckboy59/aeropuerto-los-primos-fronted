import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Users } from './users';
import { ApiService } from '../../core/api.service';

describe('Users', () => {
  let component: Users;
  let fixture: ComponentFixture<Users>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Users],
      providers: [
        provideRouter([]),
        {
          provide: ApiService,
          useValue: {
            getUsers: () => of([]),
            createUser: () => of({}),
            updateUser: () => of({}),
            deleteUser: () => of({})
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Users);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
