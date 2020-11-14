<header id="content-header">
    <nav class="fixed-top">
        <div id="main-menu">
            <div class="container">
                <a href="{{'homeURL'}}}">
                    <h5>Site Name</h5>
                </a>
                <div class="mobile-menu-btn">
                    <button class="btn-icon" data-menu="mobile-main">
                        <i class="fas fa-bars text-white"></i>
                    </button>
                </div>
            </div>
        </div>
    </nav>
    <a href="javascript:void(0);" class="text-white chat-btn">
        <i class="far fa-envelope"></i>
        <span class="badge badge-danger"></span>
    </a>
</header>
@include('components.chat')

<button type="button" class="btn btn-primary col-6 contact-vendor" data-vendor-id="{{$vendorsUser->id}}" data-customer-id="{{isset($currentUser->id)?$currentUser->id:''}}">{{trans('frontend.chat.contactVendor')}}</button>
