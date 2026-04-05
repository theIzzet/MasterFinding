namespace Services.Shared.Dtos
{
   
    public class ResultDto
    {
        public bool Success { get; set; }
        public IEnumerable<string> Errors { get; set; } = new List<string>();

        public static ResultDto Succeed() => new ResultDto { Success = true };

        public static ResultDto Fail(string error) => new ResultDto { Success = false, Errors = new[] { error } };
        public static ResultDto Fail(IEnumerable<string> errors) => new ResultDto { Success = false, Errors = errors };
    }
    public class ResultDto<T> : ResultDto
    {
        public T Data { get; set; }

        public static ResultDto<T> Succeed(T data) => new ResultDto<T> { Success = true, Data = data };
        public new static ResultDto<T> Fail(string error) => new ResultDto<T> { Success = false, Errors = new[] { error } };
        public new static ResultDto<T> Fail(IEnumerable<string> errors) => new ResultDto<T> { Success = false, Errors = errors };
    }
}
