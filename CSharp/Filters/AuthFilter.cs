using Microsoft.AspNetCore.Mvc.Filters;

namespace HomeServicesPlatform.Filters
{
    public class AuthFilter : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            if (!context.HttpContext.Items.ContainsKey("UserId"))
            {
                context.Result = new Microsoft.AspNetCore.Mvc.UnauthorizedObjectResult(new { error = "Unauthorized" });
            }
            base.OnActionExecuting(context);
        }
    }
}
