import api from "@/services/api";

export default {
  /*
    |--------------------------------------------------------------------------
    | Get Comments
    |--------------------------------------------------------------------------
    */

  getComments(taskId) {
    return api.get(`/tasks/${taskId}/comments`);
  },

  /*
    |--------------------------------------------------------------------------
    | Add Comment
    |--------------------------------------------------------------------------
    */

  addComment(taskId, data) {
    return api.post(`/tasks/${taskId}/comments`, data);
  },

  /*
    |--------------------------------------------------------------------------
    | Delete Comment
    |--------------------------------------------------------------------------
    */

  deleteComment(commentId) {
    return api.delete(`/comments/${commentId}`);
  },
};
