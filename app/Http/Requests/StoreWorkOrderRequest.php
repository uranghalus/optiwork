<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreWorkOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title'           => ['required', 'string', 'max:255'],
            'job_description' => ['required', 'string'],
            'priority'        => ['required', 'in:low,medium,high,urgent'],
            'status'          => ['required', 'in:open,in_progress,pending,resolved,closed'],
            'tenant_id'       => ['nullable', 'integer', 'exists:tenants,id'],
            'attachment'      => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf,doc,docx', 'max:10240'], // max 10MB
        ];
    }
}
