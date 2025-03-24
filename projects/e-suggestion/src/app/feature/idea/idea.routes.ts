import { Routes } from '@angular/router';
import { AttachementService } from '../../pattern/attachment-upload/services/attachment.service';
import { AssignedIdeaStore } from './components/assigned-ideas-list/assigned-idea.store';
import {
  CreatePageGuard,
  EditPageGuard,
  ReviewPageGuard,
  ViewDetailPageGuard,
} from './guards/pages.guard';
import { RatingMatrixService } from './idea-review/rating-matrix.service';
import { ContentProcessingService } from './services/content-processing.service';
import { IdeaService } from './services/idea.service';
import { IdeaStore } from './services/idea.store';

export default <Routes>[
  {
    path: '',

    providers: [
      IdeaStore,
      IdeaService,
      ContentProcessingService,
      AttachementService,
    ],

    data: {
      breadcrumb: {
        label: 'Ideas',
      },
    },

    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full',
      },

      {
        path: 'list',
        loadComponent: () =>
          import('./components/ideas-list/ideas-list.component').then(
            m => m.IdeasListComponent
          ),
        data: {
          breadcrumb: {
            label: 'List',
          },
        },
      },

      {
        path: 'assigned',
        providers: [AssignedIdeaStore],
        loadComponent: () =>
          import(
            './components/assigned-ideas-list/assigned-ideas-list.component'
          ).then(m => m.AssignedIdeasListComponent),
        data: {
          breadcrumb: {
            label: 'Assigned',
          },
        },
      },

      {
        path: 'create',
        canActivate: [CreatePageGuard],
        loadComponent: () =>
          import('./components/add-idea/add-idea.component').then(
            m => m.AddIdeaComponent
          ),
        data: {
          breadcrumb: {
            label: 'Create',
          },
        },
      },

      {
        path: ':id/edit',
        canActivate: [EditPageGuard],
        loadComponent: () =>
          import('./components/edit-idea/edit-idea.component').then(
            m => m.EditIdeaComponent
          ),
        data: {
          breadcrumb: {
            label: 'Edit',
          },
        },
      },

      {
        path: ':id/detail',
        canActivate: [ViewDetailPageGuard],
        loadComponent: () =>
          import('./components/idea-detail/idea-detail.component').then(
            m => m.IdeaDetailComponent
          ),
        data: {
          breadcrumb: {
            label: 'Details',
          },
        },
      },

      {
        path: ':id/review',
        providers: [RatingMatrixService],
        canActivate: [ReviewPageGuard],
        loadComponent: () =>
          import(
            './idea-review/components/idea-review/idea-review.component'
          ).then(m => m.IdeaReviewComponent),
        data: {
          breadcrumb: {
            label: 'Review',
          },
        },
      },
    ],
  },
];
