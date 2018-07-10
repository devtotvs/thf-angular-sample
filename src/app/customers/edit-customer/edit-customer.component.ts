import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { Subscription } from 'rxjs/Subscription';

import { ThfBreadcrumb } from '@totvs/thf-ui/components/thf-breadcrumb/thf-breadcrumb.interface';
import { ThfCheckboxGroupOption, ThfLookupColumn, ThfSelectOption } from '@totvs/thf-ui/components/thf-field';
import { ThfI18nService } from '@totvs/thf-ui/services/thf-i18n';
import { ThfModalAction } from '@totvs/thf-ui/components/thf-modal';
import { ThfModalComponent } from '@totvs/thf-ui/components/thf-modal/thf-modal.component';
import { ThfNotificationService } from '@totvs/thf-ui/services/thf-notification/thf-notification.service';
import { ThfPageAction } from '@totvs/thf-ui/components/thf-page';

import { Customer } from './../../shared/customer';
import { CustomersLookupService } from '../../services/costumers-lookup.service';
import { CustomersService } from '../../services/customers.service';

@Component({
  selector: 'app-edit-customer',
  templateUrl: './edit-customer.component.html',
  styleUrls: ['./edit-customer.component.css']
})
export class EditCustomerComponent implements OnInit, OnDestroy {

  confirmDeleteAction: ThfModalAction;
  confirmReturnToListAction: ThfModalAction;
  returnAction: ThfModalAction;
  returnAction2: ThfModalAction;

  editUserBreadcrumb: ThfBreadcrumb;
  newUserBreadcrumb: ThfBreadcrumb;

  editUserActions: Array<ThfPageAction>;
  newUserActions: Array<ThfPageAction>;

  customer: Customer = new Customer();
  literals = {};
  isPageEdit: boolean;
  personalityOptions: Array<ThfCheckboxGroupOption>;

  hero: string;

  public readonly columns: Array<ThfLookupColumn> = [
    { column: 'nickname', label: 'Hero' },
    { column: 'label', label: 'Name' }
  ];

  readonly nationalityOptions: Array<ThfSelectOption> = [
    { label: 'Coruscant', value: 'coruscant' },
    { label: 'Death Star', value: 'deathstar' },
    { label: 'Kamino', value: 'kamino' },
    { label: 'Naboo', value: 'naboo' }
  ];

  readonly statusOptions: Array<ThfSelectOption> = [
    { label: 'Rebel', value: 'rebel' },
    { label: 'Tattoine', value: 'tatooine' },
    { label: 'Galactic', value: 'galactic' }
  ];

  private literalsSubscription: Subscription;

  @ViewChild('modalDeleteUser') modalDeleteUser: ThfModalComponent;
  @ViewChild('modalCancelEditUser') modalCancelEditUser: ThfModalComponent;

  constructor(
    private customersService: CustomersService,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private thfI18nService: ThfI18nService,
    public lookupService: CustomersLookupService,
    public thfNotification: ThfNotificationService,
  ) { }

  ngOnDestroy() {
    this.literalsSubscription.unsubscribe();
  }

  ngOnInit() {

    this.literalsSubscription = this.thfI18nService.getLiterals().subscribe(literals => {
      this.literals = literals;
      this.setLiteralsDefaultValues();
    });

    this.getCustomer();
  }

  private addCustomer(customer: Customer) {
    this.customersService.addCustomer(customer).subscribe(() => {
      this.router.navigate(['/customers']);
      this.thfNotification.success('Cliente cadastrado com sucesso.');
    });
  }

  private deleteCustomer() {
    this.customersService.deleteCustomer(this.customer.id).subscribe(data => {
      this.router.navigate(['/customers']);
      this.thfNotification.success(this.literals['excludedCustomer']);
    });
  }

  private getCustomer() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.isPageEdit = true;
      this.customersService.getCustomer(id).subscribe((customer: Customer) => {
        this.customer = customer[0];
      });
    }
  }

  private onConfirmDelete() {
    this.modalDeleteUser.close();
    this.deleteCustomer();
  }

  private setLiteralsDefaultValues() {
    this.confirmDeleteAction = {
      action: () => this.onConfirmDelete(), label: this.literals['remove']
    };

    this.returnAction = {
      action: () => this.modalDeleteUser.close(), label: this.literals['return']
    };

    this.returnAction2 = {
      action: () => this.modalCancelEditUser.close(), label: this.literals['return']
    };

    this.confirmReturnToListAction = {
      label: this.literals['cancel'], action: () => this.location.back()
    };

    this.editUserBreadcrumb = {
      items: [
        { label: this.literals['customers'], link: '/customers' },
        { label: this.literals['editClient'], link: '/customers/edit-customer' }
      ]
    };

    this.newUserBreadcrumb = {
      items: [
        { label: this.literals['customers'], link: '/customers' },
        { label: this.literals['addNewClient'], link: '/customers/new-customer' }
      ]
    };

    this.editUserActions = [
      { label: this.literals['saveClient'], action: this.updateCustomer.bind(this, this.customer), icon: 'thf-icon-plus' },
      { label: this.literals['return'], action: () => this.modalCancelEditUser.open() },
      { label: this.literals['print'], action: () => alert('Imprimir') },
      { label: this.literals['remove'], action: () => this.modalDeleteUser.open() },
    ];

    this.personalityOptions = [
      { value: 'Crafter', label: this.literals['crafter'] },
      { value: 'Inventor', label: this.literals['inventor'] },
      { value: 'Protetor', label: this.literals['protector'] },
      { value: 'Controlador', label: this.literals['controller'] },
      { value: 'Performer', label: this.literals['performer'] },
      { value: 'Idealista', label: this.literals['idealist'] }
    ];

    this.newUserActions = [
      { label: this.literals['saveClient'], action: this.addCustomer.bind(this, this.customer), icon: 'thf-icon-plus' },
      { label: this.literals['return'], action: () => this.location.back() }
    ];
  }

  private updateCustomer() {
    this.customersService.updateCustomer(this.customer).subscribe(() => {
      this.router.navigate(['/customers']);
      this.thfNotification.success('Alteração efetuada com sucesso.');
    });
  }

}