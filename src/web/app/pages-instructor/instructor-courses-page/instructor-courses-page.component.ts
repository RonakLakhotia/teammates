import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { HttpRequestService } from '../../../services/http-request.service';
import { StatusMessageService } from '../../../services/status-message.service';
import { MessageOutput } from '../../../types/api-output';
import { ErrorMessageOutput } from '../../error-message-output';
import {
  CoursePermanentDeletionConfirmModalComponent,
} from './course-permanent-deletion-confirm-modal/course-permanent-deletion-confirm-modal.component';
import {
  CourseSoftDeletionConfirmModalComponent,
} from './course-soft-deletion-confirm-modal/course-soft-deletion-confirm-modal.component';

interface ActiveCourse {
  id: string;
  name: string;
  createdAt: string;
  canModifyCourse: boolean;
  canModifyStudent: boolean;
}

interface ArchivedCourse {
  id: string;
  name: string;
  createdAt: string;
  canModifyCourse: boolean;
}

interface SoftDeletedCourse {
  id: string;
  name: string;
  createdAt: string;
  deletedAt: string;
  canModifyCourse: boolean;
}

interface CourseStats {
  sectionsTotal: number;
  teamsTotal: number;
  studentsTotal: number;
  unregisteredTotal: number;
}

interface InstructorPrivileges {
  courseLevel: { [key: string]: boolean };
}

interface Instructor {
  courseId: string;
  privileges: InstructorPrivileges;
}

interface InstructorCourses {
  activeCourses: ActiveCourse[];
  archivedCourses: ArchivedCourse[];
  softDeletedCourses: SoftDeletedCourse[];
  instructorList: Instructor[];
}

/**
 * Instructor courses list page.
 */
@Component({
  selector: 'tm-instructor-courses-page',
  templateUrl: './instructor-courses-page.component.html',
  styleUrls: ['./instructor-courses-page.component.scss'],
})
export class InstructorCoursesPageComponent implements OnInit {

  user: string = '';

  activeCourses: ActiveCourse[] = [];
  archivedCourses: ArchivedCourse[] = [];
  softDeletedCourses: SoftDeletedCourse[] = [];
  instructorList: Instructor[] = [];
  courseStats: { [key: string]: { [key: string]: number } } = {};

  canDeleteAll: boolean = true;
  canRestoreAll: boolean = true;

  constructor(private route: ActivatedRoute,
              private httpRequestService: HttpRequestService,
              private statusMessageService: StatusMessageService,
              private modalService: NgbModal) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams: any) => {
      this.user = queryParams.user;
      this.loadInstructorCourses();
    });
  }

  /**
   * Loads instructor courses required for this page.
   */
  loadInstructorCourses(): void {
    const paramMap: { [key: string]: string } = {
      user: this.user,
    };
    this.httpRequestService.get('/instructor/courses', paramMap).subscribe((resp: InstructorCourses) => {
      this.activeCourses = resp.activeCourses;
      this.archivedCourses = resp.archivedCourses;
      this.softDeletedCourses = resp.softDeletedCourses;
      this.instructorList = resp.instructorList;

      for (const course of this.activeCourses) {
        for (const instructor of this.instructorList) {
          if (course.id === instructor.courseId) {
            course.canModifyCourse = instructor.privileges.courseLevel.canmodifycourse;
            course.canModifyStudent = instructor.privileges.courseLevel.canmodifystudent;
            break;
          }
        }
      }

      for (const course of this.archivedCourses) {
        for (const instructor of this.instructorList) {
          if (course.id === instructor.courseId) {
            course.canModifyCourse = instructor.privileges.courseLevel.canmodifycourse;
            break;
          }
        }
      }

      for (const course of this.softDeletedCourses) {
        for (const instructor of this.instructorList) {
          if (course.id === instructor.courseId) {
            course.canModifyCourse = instructor.privileges.courseLevel.canmodifycourse;
            if (!course.canModifyCourse) {
              this.canDeleteAll = false;
              this.canRestoreAll = false;
            }
            break;
          }
        }
      }
    }, (resp: ErrorMessageOutput) => {
      this.statusMessageService.showErrorMessage(resp.error.message);
    });
  }

  /**
   * Constructs the url for course stats from the given course id.
   */
  getCourseStats(courseId: string): void {
    if (!courseId) {
      this.statusMessageService.showErrorMessage(`Course ${courseId} is not found!`);
      return;
    }
    const paramMap: { [key: string]: string } = {
      courseid: courseId,
      user: this.user,
    };
    this.httpRequestService.get('/course/stats', paramMap).subscribe((resp: CourseStats) => {
      this.courseStats[courseId] = {
        sections: resp.sectionsTotal,
        teams: resp.teamsTotal,
        students: resp.studentsTotal,
        unregistered: resp.unregisteredTotal,
      };
    }, (resp: ErrorMessageOutput) => {
      this.statusMessageService.showErrorMessage(resp.error.message);
    });
  }

  /**
   * Archives an active course.
   */
  onArchive(courseId: string): void {
    if (!courseId) {
      this.statusMessageService.showErrorMessage(`Course ${courseId} is not found!`);
      return;
    }
    const paramMap: { [key: string]: string } = {
      courseid: courseId,
      archive: 'true',
      user: this.user,
    };
    this.httpRequestService.put('/course', paramMap).subscribe((resp: MessageOutput) => {
      this.loadInstructorCourses();
      this.statusMessageService.showSuccessMessage(resp.message);
    }, (resp: ErrorMessageOutput) => {
      this.statusMessageService.showErrorMessage(resp.error.message);
    });
  }

  /**
   * Unarchives an archived course.
   */
  onUnarchive(courseId: string): void {
    if (!courseId) {
      this.statusMessageService.showErrorMessage(`Course ${courseId} is not found!`);
      return;
    }
    const paramMap: { [key: string]: string } = {
      courseid: courseId,
      archive: 'false',
      user: this.user,
    };
    this.httpRequestService.put('/course', paramMap).subscribe((resp: MessageOutput) => {
      this.loadInstructorCourses();
      this.statusMessageService.showSuccessMessage(resp.message);
    }, (resp: ErrorMessageOutput) => {
      this.statusMessageService.showErrorMessage(resp.error.message);
    });
  }

  /**
   * Moves an active/archived course to Recycle Bin.
   */
  onDelete(courseId: string): void {
    if (!courseId) {
      this.statusMessageService.showErrorMessage(`Course ${courseId} is not found!`);
      return;
    }
    const modalRef: NgbModalRef = this.modalService.open(CourseSoftDeletionConfirmModalComponent);
    modalRef.result.then(() => {
      const paramMap: { [key: string]: string } = {
        courseid: courseId,
        user: this.user,
      };

      this.httpRequestService.delete('/course', paramMap).subscribe((resp: MessageOutput) => {
        this.loadInstructorCourses();
        this.statusMessageService.showSuccessMessage(resp.message);
      }, (resp: ErrorMessageOutput) => {
        this.statusMessageService.showErrorMessage(resp.error.message);
      });
    }, () => {});
  }

  /**
   * Permanently deletes a soft-deleted course in Recycle Bin.
   */
  onDeletePermanently(courseId: string): void {
    if (!courseId) {
      this.statusMessageService.showErrorMessage(`Course ${courseId} is not found!`);
      return;
    }
    const modalRef: NgbModalRef = this.modalService.open(CoursePermanentDeletionConfirmModalComponent);
    modalRef.componentInstance.courseId = courseId;
    modalRef.result.then(() => {
      const paramMap: { [key: string]: string } = {
        courseid: courseId,
        user: this.user,
      };
      this.httpRequestService.delete('/instructor/courses/permanentlyDelete', paramMap)
          .subscribe((resp: MessageOutput) => {
            this.loadInstructorCourses();
            this.statusMessageService.showSuccessMessage(resp.message);
          }, (resp: ErrorMessageOutput) => {
            this.statusMessageService.showErrorMessage(resp.error.message);
          });
    }, () => {});
  }

  /**
   * Restores a soft-deleted course from Recycle Bin.
   */
  onRestore(courseId: string): void {
    if (!courseId) {
      this.statusMessageService.showErrorMessage(`Course ${courseId} is not found!`);
      return;
    }
    const paramMap: { [key: string]: string } = {
      courseid: courseId,
      user: this.user,
    };
    this.httpRequestService.delete('/bin/course', paramMap).subscribe((resp: MessageOutput) => {
      this.loadInstructorCourses();
      this.statusMessageService.showSuccessMessage(resp.message);
    }, (resp: ErrorMessageOutput) => {
      this.statusMessageService.showErrorMessage(resp.error.message);
    });
  }

  /**
   * Permanently deletes all soft-deleted courses in Recycle Bin.
   */
  onDeleteAll(): void {
    const modalRef: NgbModalRef = this.modalService.open(CoursePermanentDeletionConfirmModalComponent);
    modalRef.componentInstance.isDeleteAll = true;
    modalRef.result.then(() => {
      const paramMap: { [key: string]: string } = {
        user: this.user,
      };
      this.httpRequestService.delete('/instructor/courses/permanentlyDeleteAll', paramMap)
          .subscribe((resp: MessageOutput) => {
            this.loadInstructorCourses();
            this.statusMessageService.showSuccessMessage(resp.message);
          }, (resp: ErrorMessageOutput) => {
            this.statusMessageService.showErrorMessage(resp.error.message);
          });
    }, () => {});
  }

  /**
   * Restores all soft-deleted courses from Recycle Bin.
   */
  onRestoreAll(): void {
    const paramMap: { [key: string]: string } = {
      user: this.user,
    };
    this.httpRequestService.put('/instructor/courses/restoreAll', paramMap).subscribe((resp: MessageOutput) => {
      this.loadInstructorCourses();
      this.statusMessageService.showSuccessMessage(resp.message);
    }, (resp: ErrorMessageOutput) => {
      this.statusMessageService.showErrorMessage(resp.error.message);
    });
  }

}
