public interface IExamService
{
    Task AllocateSeats(int examId);
    Task AllocateSeatsForStudents(int examId, List<int> studentIds);
    Task<List<Exam>> GetAllExams();
    Task<Exam> GetExamById(int id);
    Task<Exam> CreateExam(Exam exam);
}