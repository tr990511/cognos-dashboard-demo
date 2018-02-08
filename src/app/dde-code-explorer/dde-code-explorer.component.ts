import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DdeApiService } from '../services/dde-api.service';
import { Session } from '../../model/session';
import { CodeSnippet, CodeSnippetEnum } from '../../model/code-snippet';
import { CSVDataSource, ProtectedCSVDataSource, /*DB2DataSource, ProtectedDB2DataSource,*/ BikeShareWeatherCSVSource, BikeShareRidesDemographCSVSource } from '../../model/data-source';
import { CodeSnippetsRepoService } from '../services/code-snippets-repo.service';
import * as DashboardMode from '../../model/dashboard-mode';
declare var Prism: any;

@Component({
  selector: 'dde-code-explorer',
  templateUrl: './dde-code-explorer.component.html',
  styleUrls: ['./dde-code-explorer.component.css']
})
export class DdeCodeExplorerComponent implements OnInit {
  @Output() session: EventEmitter<Session> = new EventEmitter<Session>();
  @Output() apiId: EventEmitter<string> = new EventEmitter<string>();
  @Output() dashboardApi: EventEmitter<string> = new EventEmitter<string>();
  @Output() dashboardSpec: EventEmitter<void> = new EventEmitter<void>();
  @Output() updateModuleDefinitions: EventEmitter<void> = new EventEmitter<void>();
  @Output() clearDirtyState: EventEmitter<void> = new EventEmitter<void>();
  @Output() registerCallback: EventEmitter<void> = new EventEmitter<void>();
  @Output() unregisterCallback: EventEmitter<void> = new EventEmitter<void>();
  @Input() codeSnippet : CodeSnippet;
  dataSources = [CSVDataSource, ProtectedCSVDataSource, /*DB2DataSource, ProtectedDB2DataSource,*/ BikeShareWeatherCSVSource, BikeShareRidesDemographCSVSource ];
  dashboardModes = [DashboardMode.EditMode, DashboardMode.ViewMode, DashboardMode.EditGroupMode];
  sampleModule : string;
  sessionObject = null;

  constructor(private ddeApiService: DdeApiService, private codeSnippetsRepoService: CodeSnippetsRepoService) { }

  ngOnInit() {
  }

  setExplorerDiv() {
      Prism.highlightAll();
      let classes =  {
          divsmall: this.codeSnippet && this.codeSnippet.size === 'small',
          divlarge: !this.codeSnippet || this.codeSnippet.size === 'large'
      };
      return classes;
  }

  async runCode(event) {
    try {
      if (this.codeSnippet.selection === CodeSnippetEnum.CreateSession) {
        this.sessionObject = await this.ddeApiService.createNewSession();
        this.session.emit(this.sessionObject);
        this.resetAllRunButtons();
      }
      else if (this.codeSnippet.selection === CodeSnippetEnum.CreateAPIFramework) {
        this.apiId.emit(await this.ddeApiService.createAndInitApiFramework());
        this.resetAllRunButtons();
        this.enableRunButton(CodeSnippetEnum.CreateDashboard);
        this.enableRunButton(CodeSnippetEnum.OpenDashboard);
      }
      else if (this.codeSnippet.selection === CodeSnippetEnum.CreateDashboard) {
        this.dashboardApi.emit(await this.ddeApiService.createDashboard());
        this.enableDashboardInteractionRunButton();
        this.enableRunButton(CodeSnippetEnum.GetDashboardSpec);
        this.enableRunButton(CodeSnippetEnum.ClearDirtyState);
        this.enableRunButton(CodeSnippetEnum.RegisterCallback);
        this.enableRunButton(CodeSnippetEnum.UnregisterCallback);
      }
      else if (this.codeSnippet.selection === CodeSnippetEnum.OpenDashboard) {
        this.dashboardApi.emit(await this.ddeApiService.openDashboard());
        this.enableDashboardInteractionRunButton();
      }
      else if (this.codeSnippet.selection === CodeSnippetEnum.AddCSVSource) {
        this.ddeApiService.addCSVSampleSource();
        this.enableRunButton(CodeSnippetEnum.UpdateModuleDefinitions);
      }
      else if (this.codeSnippet.selection === CodeSnippetEnum.AddProtectedCSVSource) {
        this.ddeApiService.addProtectedCSVSampleSource();
        this.enableRunButton(CodeSnippetEnum.UpdateModuleDefinitions);
      }
      else if (this.codeSnippet.selection === CodeSnippetEnum.AddBikeShareRidesDemographCSVSource) {
        this.ddeApiService.addBikeShareRidesDemographCSVSampleSource();
        this.enableRunButton(CodeSnippetEnum.UpdateModuleDefinitions);
      }
      else if (this.codeSnippet.selection === CodeSnippetEnum.AddBikeShareWeatherCSVSource) {
        this.ddeApiService.addBikeShareWeatherCSVSampleSource();
        this.enableRunButton(CodeSnippetEnum.UpdateModuleDefinitions);
      }
      else if (this.codeSnippet.selection === CodeSnippetEnum.DashboardEditMode) {
        this.ddeApiService.setDashboardMode_Edit();
      }
      else if (this.codeSnippet.selection === CodeSnippetEnum.DashboardViewMode) {
        this.ddeApiService.setDashboardMode_View();
      }
      else if (this.codeSnippet.selection === CodeSnippetEnum.DashboardEditGroupMode) {
        this.ddeApiService.setDashboardMode_EditGroup();
      }
      else if (this.codeSnippet.selection === CodeSnippetEnum.UndoLastAction) {
        this.ddeApiService.undoLastAction();
      }
      else if (this.codeSnippet.selection === CodeSnippetEnum.RedoLastAction) {
        this.ddeApiService.redoLastAction();
      }
      else if (this.codeSnippet.selection === CodeSnippetEnum.TogglePropertiesPane) {
        this.ddeApiService.togglePropertiesPane();
      }
      else if (this.codeSnippet.selection === CodeSnippetEnum.GetDashboardSpec) {
        await this.ddeApiService.getDashboardSpec();
        this.dashboardSpec.emit();
      }
      else if (this.codeSnippet.selection === CodeSnippetEnum.UpdateModuleDefinitions) {
        this.ddeApiService.updateModuleDefinitions();
        this.updateModuleDefinitions.emit();
      }
      else if (this.codeSnippet.selection === CodeSnippetEnum.ClearDirtyState) {
        this.ddeApiService.clearDirtyState();
        this.clearDirtyState.emit();
      }
      else if (this.codeSnippet.selection === CodeSnippetEnum.RegisterCallback) {
        this.ddeApiService.registerCallback();
        this.registerCallback.emit();
      }
      else if (this.codeSnippet.selection === CodeSnippetEnum.UnregisterCallback) {
        this.ddeApiService.unregisterCallback();
        this.unregisterCallback.emit();
      }

    }
    catch(e) {
      console.log(e);
      this.session.emit(null);
      this.apiId.emit('');
    }
  }

  enableDashboardInteractionRunButton() {
    this.enableRunButton(CodeSnippetEnum.AddCSVSource);
    this.enableRunButton(CodeSnippetEnum.AddProtectedCSVSource);
    this.enableRunButton(CodeSnippetEnum.AddBikeShareRidesDemographCSVSource);
    this.enableRunButton(CodeSnippetEnum.AddBikeShareWeatherCSVSource);
    this.enableRunButton(CodeSnippetEnum.DashboardEditMode);
    this.enableRunButton(CodeSnippetEnum.DashboardViewMode);
    this.enableRunButton(CodeSnippetEnum.DashboardEditGroupMode);
    this.enableRunButton(CodeSnippetEnum.UndoLastAction);
    this.enableRunButton(CodeSnippetEnum.RedoLastAction);
    this.enableRunButton(CodeSnippetEnum.TogglePropertiesPane);
  }

  enableRunButton(type: CodeSnippetEnum) {
    let snippet = this.codeSnippetsRepoService.getSnippet(type);
    snippet.disableRun = false;
    this.codeSnippetsRepoService.setSnippet(type, snippet);
  }

  resetAllRunButtons() {
    this.codeSnippetsRepoService.disableRunButton();
    this.enableRunButton(CodeSnippetEnum.CreateAPIFramework);
  }

  onDisableRunButton() {
    let disableButton = this.codeSnippet.disableRun;
    let classes =  {
        disabled: disableButton,
        enabled: !disableButton
    };
    return classes;
  }

  onSelect(sourceValue) {
    for (var i = 0; i < this.dataSources.length; i++) {
      if (this.dataSources[i].value === sourceValue) {
        this.codeSnippet = this.codeSnippetsRepoService.getSnippet(sourceValue);
      }
    }
  }

  onSelectMode(modeValue) {
    for (var i = 0; i < this.dashboardModes.length; i++) {
      if (this.dashboardModes[i].value === modeValue) {
        this.codeSnippet = this.codeSnippetsRepoService.getSnippet(modeValue);
      }
    }
  }

  showSessionPanel() {
    return this.codeSnippet && (this.codeSnippet.selection === CodeSnippetEnum.CreateAPIFramework);
  }

  showSourcesDropDown() {
    return this.codeSnippet && (this.codeSnippet.selection === CodeSnippetEnum.AddCSVSource ||
          this.codeSnippet.selection === CodeSnippetEnum.AddProtectedCSVSource ||
          //this.codeSnippet.selection === CodeSnippetEnum.AddDB2Source ||
          //this.codeSnippet.selection === CodeSnippetEnum.AddProtectedDB2Source ||
          this.codeSnippet.selection === CodeSnippetEnum.AddBikeShareWeatherCSVSource ||
          this.codeSnippet.selection === CodeSnippetEnum.AddBikeShareRidesDemographCSVSource);
  }

  showDashboardModesDropDown() {
    return this.codeSnippet && (this.codeSnippet.selection === CodeSnippetEnum.DashboardViewMode ||
          this.codeSnippet.selection === CodeSnippetEnum.DashboardEditMode ||
          this.codeSnippet.selection === CodeSnippetEnum.DashboardEditGroupMode);
  }

}
