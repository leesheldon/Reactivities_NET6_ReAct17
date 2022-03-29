using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Core;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BaseApiController : ControllerBase
    {
        private IMediator _mediator;

        // ??= means if _mediator is null then HttpContext.RequestServices.GetService<IMediator>()
        // instead of this --> _mediator ?? (_mediator= HttpContext.RequestServices.GetService<IMediator>());
        protected IMediator Mediator => _mediator ??= HttpContext.RequestServices.GetService<IMediator>();

        protected ActionResult HandleResult<T>(Result<T> result)
        {
            if (result == null) return NotFound();
            
            if (result.isSuccess && result.Value != null)
                return Ok(result.Value);

            if (result.isSuccess && result.Value == null)
                return NotFound();

            return BadRequest(result.Error);
        }

    }
}