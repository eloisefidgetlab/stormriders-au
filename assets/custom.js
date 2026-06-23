/**
 * Include your custom JavaScript here.
 *
 * We also offer some hooks so you can plug your own logic. For instance, if you want to be notified when the variant
 * changes on product page, you can attach a listener to the document:
 *
 * document.addEventListener('variant:changed', function(event) {
 *   var variant = event.detail.variant; // Gives you access to the whole variant details
 * });
 *
 * You can also add a listener whenever a product is added to the cart:
 *
 * document.addEventListener('product:added', function(event) {
 *   var variant = event.detail.variant; // Get the variant that was added
 *   var quantity = event.detail.quantity; // Get the quantity that was added
 * });
 *
 * If you just want to force refresh the mini-cart without adding a specific product, you can trigger the event
 * "cart:refresh" in a similar way (in that case, passing the quantity is not necessary):
 *
 * document.documentElement.dispatchEvent(new CustomEvent('cart:refresh', {
 *   bubbles: true
 * }));
 */

(function() {
	if ($('body').hasClass('template-collection')) {
	
		$(window).on('scroll resize', initStaggeringEffect);
		if (!window.location.href.includes("scroll=")) {
			$(window).on('scroll resize', triggerInfiniteLoad);
			$(window).trigger('scroll');
		} else {
			$(window).on('load', function() {
				var searchParams = new URLSearchParams(window.location.search);
				var productId = searchParams.get('scroll');
				setTimeout(function() { // Added buffer to load items first
					$('html, body').scrollTop( $(".ProductItem[data-id=" + productId + "]").offset().top - 120);
				}, 500);
				setTimeout(function() { // Added buffer to prevent triggering infinite load while scrolltop is ongoing
					$(window).on('scroll resize', triggerInfiniteLoad);
				}, 1000);
			});
		}

		$(window).on('unload', function() {
			$(window).scrollTop(0);
		});

		$('body').on('click', 'a.ProductItem__ImageWrapper', function(e) {
			var productPage = $(this).closest('.Grid__Cell').data('page');
			var productId = $(this).closest('.ProductItem').data('id');
			var productUrl = $(this).attr('href');
			if (productPage) {
				e.preventDefault();
				var newUrl = window.location.href.split('?')[0] + '?page=' + productPage + '&scroll=' + productId;
				window.history.replaceState({}, '', newUrl);
				window.location = productUrl;
			}
		});
	}
}());

let trackAll = 1;
let trackLoadAll = 0;
function loadUrlInAjax(url, paginationType) {
	$.ajax({
		type: 'GET',
		url: url,
		dataType: "html",
		beforeSend: function () {

		},
		success: function (data) {
			var pageData = $(data).find('.ProductList--grid').html();
			if (paginationType == 'next') {
				$('.ProductList--grid').append(pageData).find('.paginate-previous:last').remove();
			} else {
				$('.ProductList--grid').prepend(pageData).find('.paginate-next:first').remove();
				initStaggeringEffect();
			}
		}
	});
}

// Add Staggering animation for newly loaded collection tiles by infinite scroll
function initStaggeringEffect() {
	var $window = $(window);
	var $animation_elements = $('body').find('.animation-element:not(.in-view):not(.toAnimate)');

	if ($animation_elements.length) {
		var window_height = $window.height();
		var window_top_position = $window.scrollTop();
		var window_bottom_position = (window_top_position + window_height);
		
		$($animation_elements).each(function() {
			var $element = $(this);
			var element_height = $element.outerHeight();
			var element_top_position = $element.offset().top;
			var element_bottom_position = (element_top_position + element_height);
		
			// Check to see if this current container is within viewport
			if ((element_bottom_position >= window_top_position) &&
				(element_top_position <= window_bottom_position)) {
				$element.addClass('stagger');
			}
		});
		
		var $toAnimate = $('body').find('.animation-element.stagger:not(.in-view):not(.toAnimate)');
		if ($toAnimate.length > 0 && $('body').find('.animation-element.toAnimate').length == 0) {
			$toAnimate.addClass('toAnimate');
			var i = 0;
			var loop = window.setInterval(function () {
				if ($($toAnimate[i]).length) {
					$($toAnimate[i]).addClass('in-view');
				}

				i++;

				if (i == $toAnimate.length) {
					clearInterval(loop);
					$toAnimate.removeClass('toAnimate');
					initStaggeringEffect();
				}
			}, 100);
		}
	}
}

function triggerInfiniteLoad() {
	var $window = $(window);
	var $pagination_element = $('body').find('.pagination-link');

	if ($pagination_element.length) {
		var window_height = $window.height();
		var window_top_position = $window.scrollTop();
		var window_bottom_position = (window_top_position + window_height);
		
		$($pagination_element).each(function() {
			var $element = $(this);
			var element_height = $element.outerHeight();
			var element_top_position = $element.offset().top;
			var element_bottom_position = (element_top_position + element_height);
		
			// Check to see if this current container is within viewport
			if ((element_bottom_position >= window_top_position) &&
				(element_top_position <= window_bottom_position)) {
				var url = $element.find('a').attr('href');
				var paginationType = $element.hasClass('paginate-next') ? 'next' : 'previous';
				$element.remove();
				loadUrlInAjax(url,paginationType);
			}
		});
	}
}

function triggerSizeChange(sizeValue) {
	$('.Product__OffScreen [data-value]').each(function() {
			const currentValue = $(this).data('value').trim();
			if (currentValue === sizeValue) {
				$(this).trigger('click');
			}
	});
}

function customRadio() {
	$('input[name="customSizeRadio"]').on('change', function() {
		const value = $(this).val().trim();
		triggerSizeChange(value);
	});
}

if ( $('.has-custom-radio').length ) {
	customRadio();
}

if(window.location.pathname === '/account/register') {
	if($('#customer_referral_site')) {
		// get query string
		const search = window.location.search;
		// remove '?' for use with URLSearchParams object
		const string = search.replace('?', '');
		const params = new URLSearchParams(string);
		// get value with key 'ref'
		const ref = params.get('ref');
		// set thie value to hidden input on register page
		// falls back to BC if no referral
		if(ref) {
			$('#customer_referral_site').val(ref);
		} else {
			$('#customer_referral_site').val('BC');
		}
	}
}

$(function () {
	$('.account-page-tabs').find('input[type="radio"]').each(function() {
		$(this).on('click', function() {
			const id = $(this).attr('id')
			if(id === 'account-details') {
				$('#account-addresses').show();
			} else {
				$('#account-addresses').hide();
			}
		})
	})
})

if(window.location.pathname === '/account') {
	getJsonTokenUrl('shopify/customer').then(res=>{
		// console.log(res);
		requestMetafield(res)
	})
	getJsonTokenUrl('checkout/customer_loyalty').then(res=> {
		// console.log(res);
		setRewardPoints(res);
	})
	getJsonTokenUrl('order/customer').then(res => {
		$('#order-table-desktop .AccountTable').hide()
		$('#order-table-desktop-loadder').addClass('loading')
		// console.log(res);
		setOrderHistory(res);
	})
}

async function getJsonTokenUrl(endpoint = 'shopify/customer',page=1){
	let cid = $('#account-details-save-btn').attr('data-customer-id')
	let res = await fetch("/pages/json-token")
	let result = await res.text()
	let target_url = ''
	result = result.trim()
	try {
		const query_object = JSON.parse('{"' + decodeURI(result).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}')
		const email = encodeURIComponent(query_object.email);
		const iat = query_object.iat;
		const hash = query_object.hash;
		let shopName = Shopify.shop.split('.')[0]
		let envHash = '2ebpdqvqke'
		let env = 'production'
		// just for test in local
		// shopName = 'boardcollective'
		// cid = 5948066300101
		// 
		if (shopName != 'boardcollective') {envHash = 'zgfl6oel3e'; env = 'development'}
		target_url = `https://${envHash}.execute-api.ap-southeast-2.amazonaws.com/${env}/${endpoint}/${shopName}`;
		// target_url = `http://localhost:8090/${endpoint}/${shopName}`
		target_url = `${target_url}?email=${email}&iat=${iat}&hash=${hash}&customer_id=${cid}&pageIndex=${page}`;
		return target_url
	} catch (error) {
		console.log(result)
	}
	return ''
}	

function setRewardPoints(target_url) {
	console.log(target_url);
	
	$.get(target_url).then(res => {
		console.log(res);
		$(".mr-voucher-loading").hide()
		const points = res.points;
		if(points) {
			$('#reward-points-count').text(Math.floor(points));
			if (points>=400){
				$('.mates-benefits-progress').text('0 more points to next $10 Voucher');
			}else{
				const morePoints = 400 - points
				$('.mates-benefits-progress').text(`${morePoints} more points to next $10 Voucher`);
			}
		}
		const cards = res.cards
		const $cardSection = $('.mates-benefits-vouchers')
		for (const c of cards){
			const expiryDate = c.BenefitExpiracyDate.split(' ')[0]
			const expiredDay = new Date(expiryDate).getTime()
			let expiredIn = (expiredDay-Date.now())/(1000 * 3600 * 24)
			expiredIn = expiredIn > 0 ? expiredIn : 'expired'
			// type = c.type
			if (expiredIn != 'expired'){
				expiredIn = Math.floor(expiredIn)
				availablePoints = Math.floor(c.AvailableLoyaltyPoints)
				const btype = c.BonType.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1")
				// console.log('waf',btype)
				if (btype.includes('Gift')) continue
				// change requist: hide certificate code and map loyalty certificate to loyalty credit 
				// btype replaced by ltype, c.Id were deleted
				const lTypeName = 'Loyalty Credit'
				// done 
				$cardSection.
					append(`
						<div class="voucher--container">
							<div class="voucher--left">
							<div class="left--upper">$${availablePoints}</div>
							<div class="left--lower">Off</div>
							</div>
							<div class="voucher--right">
							<div class="voucher--type">${lTypeName}</div>
							<div class="right--upper">
							</div>
							<div class="right--lower">
								<a style="cursor:pointer" onclick="voucherAddToCart('${c.Id}','${c.BonType}')" >
								Use Voucher
								</a>
								<div>Runs out in ${expiredIn} days</div>
							</div>
							</div>
						</div>`)
			}

		}
	})
}

function checkVoucherLocally(voucher_id){
	// 	{voucher_id:'code',code:'code', code4:'code'}
	// code: code is to apply in checkout, code4 is to locate and check the applied code, voucher_id:code 
	// is to filter: if this voucher id has been set to local storage
	const vouchers = JSON.parse(localStorage.getItem('mrVoucherForCheckout') || '[]')
	return vouchers.some(e=>e[voucher_id]) 
}

function setVoucherLocally(voucher_id,code,name){
	const vouchers = JSON.parse(localStorage.getItem(name) || '[]')
	const code4 = code.slice(-4)
	let v = {"code":code,'code4':code4}
	v[voucher_id]=code
	v.voucherId = voucher_id
	vouchers.push(v)
	localStorage.setItem(name,JSON.stringify(vouchers))
}

var mrModelLoading=false
function voucherAddToCart(voucher_id,bon_type){
	if (checkVoucherLocally(voucher_id)){
		$('.mr-model-wrapper').show()
		return
	}
	// console.log(voucher_id)
	mrModelLoading=true
	$(".template-account").addClass('template-account-model-show')
	$('.mr-model-background').show()
	// $('.mr-model-loading').addClass('loading')
	getJsonTokenUrl('checkout/gift_card').then(res => {
		let payload = {
			"voucher_code":voucher_id,
			"bon_type":bon_type
		}
		payload = JSON.stringify(payload)
		const settings = {
			"url": res,
			"method": "POST",
			"headers": {
			  "Content-Type": "application/json"
			},
			"data": payload,
			success: function(data){
				const {code,disabled_code} = data
				const customerId = $('#mr-customer-id').attr('data-customer-id')
				localStorage.setItem('mrVoucherCustomerId',customerId)
				// localStorage.setItem('mrVoucherForCheckout',code)
				// if (disabled_code) localStorage.setItem('mrVoucherForCheckoutDisable',disabled_code)
				setVoucherLocally(voucher_id,code,"mrVoucherForCheckout")
				// if (disabled_code) setVoucherLocally(voucher_id,disabled_code,"mrVoucherForCheckoutDisable")
				$('.mr-model-wrapper').show()
				mrModelLoading=false
			},
			error: function(data){
				mrModelLoading=false
				Swal.fire(
					{
						title: 'Sorry!',
						text: "The voucher can not be applied now. Please try again."
					}
				  )
			}
		  };
		$.ajax(settings).done(function () {
			// $('#account-details-save-btn').removeClass('loading')
			// $('#account-details-save-btn').text('SAVE')
		  });
	})
}
function mrModelClose(){
	$(".mr-model-background").hide()
	$(".mr-model-wrapper").hide()
	$(".template-account").removeClass('template-account-model-show')
}
function mrModelBackground(){
	
	$(".mr-model-background").on('click',(t)=>{
		if (mrModelLoading==true)return
		mrModelClose()
	})
}
function mrModelOnSwalContainer(){
	$(".swal2-container").on('click',(t)=>{
		if (mrModelLoading==true)return
		mrModelClose()
	})
}

function setHasNextPage(res){
	if(res.length == 20) {
		localStorage.setItem('y2_order_has_next', true)
	}else{
		localStorage.setItem('y2_order_has_next', false)
	}
}

function setOrderHistory(target_url) {
	// initOrderTable()
	console.log(target_url);
	$.get(target_url).then(res => {
		console.log('order history',res);
		$('#order-table-desktop-loadder').removeClass('loading')
		$('#order-table-desktop-loadder').hide()
		$('#order-table-desktop .AccountTable').show()
		appendOrderList(res)
		// init page value
		localStorage.setItem('y2_order_page',1)
		// validate next page
		setHasNextPage(res)
		// apply pagination if valid
		handlePagination()
	})
}
 
async function getOrderDetailsY2(payload){
	const url = await getJsonTokenUrl('order/key')
    const settings = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
		body:JSON.stringify(payload)
    };
    try {
        const fetchResponse = await fetch(url, settings);
        const data = await fetchResponse.json();
        return data;
    } catch (e) {
        return e;
    }    

}

function handlePagination(){
	// append pagiantion
	appendPaginationElement()
	// bind onclick event
	bindPaginationLink()
	
}

function appendPaginationElement(){
	const y2_order_has_next = localStorage.getItem('y2_order_has_next')
	const page = localStorage.getItem('y2_order_page')
	let temp_pagination = `
            <div class="orders-custom-pagination">
                <a id="orders-custom-paginationPrev" class="Button Button--primary Button--quater orders-custom-paginationLink ${page == 1? 'diabled-paginate' : ''}">Prev</a>
                <a id="orders-custom-paginationNext" class="Button Button--primary Button--quater orders-custom-paginationLink ${y2_order_has_next=='true' ? '' : 'diabled-paginate'}">Next</a>
            </div>
        	`;
			$('#order-y2-pagination').append(temp_pagination);
			// show page button if has next page or page > 1
			JSON.parse(y2_order_has_next)&&$('.orders-custom-pagination').show()||JSON.parse(page)>1&&$('.orders-custom-pagination').show();

}

function appendOrderList(res){
	res = res.filter(x=>x.SalesPersonId)
	console.log(res)
	const stores = {
		"210": "Saltwater Wine Port Macquarie",
		"740": "Red Herring Hobart",
		"742": "Red Herring Launceston",
		"211": "Stormriders Port Macquarie",
		"215": "Stormriders Tamworth Peel st",
		"212": "Saltwater Wine Taree",
		"743": "Red Herring Burnie213Saltwater Wine Forster",
		"223": "Stormriders Orange",
		"741": "Red Herring Northgate",
		"222": "Stormriders Bathurst",
		"228": "Stormriders Tamworth Shoppingworld",
		"224": "Stormriders Kempsey",
		"226": "Stormriders Forster"
	}
	for(let i = 0; i < res.length; i++) {
		const current = res[i];
		const options = { year: 'numeric', month: 'short', day: 'numeric' };
		const orderDate = current.Date.split(' ')[0]
		const order_date = new Date(orderDate).toLocaleString('en',options)
		const storeOrigin = current.Origin 
		const storeName = stores[current.StoreId] || current.StoreId
		// set desktop order
		let order = ''
		// ecommerce can return
		if (storeOrigin =='ECommerce'){
			continue
		order = `
		<tr>
			<td class='account-order-link' data-order-Number='${current.Key.Number}' data-order-Stump='${current.Key.Stump}' data-order-Type='${current.Key.Type}'>
			<a onclick=orderDetails("${current.Key.Number}","${current.Key.Stump}","${current.Key.Type}")>${current.InternalReference}</a></td>
			<td>${order_date}</td>
			<td>${storeName}</td>
			<td>
				$${current.TaxIncludedTotalAmount}
			</td>
		</tr>
		`
		$('#order-table-desktop').find('tbody').append(order);
		// set mobile order
		const orderMobile = `
		<ul class='order-list-mobile'>
			<li><div class="Text--subdued">Order</div> <span><a class='account-order-link' data-order-Number='${current.Key.Number}' data-order-Stump='${current.Key.Stump}' data-order-Type='${current.Key.Type}'>
			${current.Key.Number}</a></span></li>
			<li><div class="Text--subdued">DATE</div> <span>${order_date}</span></li>
			<li><div class="Text--subdued">STORE</div> <span>${current.StoreId}</span></li>
			<li><div class="Text--subdued">TOTAL</div> <span>$${current.TaxIncludedTotalAmount}</span></li>
		</ul>
		<div class="account-divider"></div>
		`
		$('#order-card-mobile-offline').append(orderMobile);
		}else{
			// not ecommerce only show in store text
			order = `
		<tr>
			<td class='account-order-link' data-order-Number='${current.Key.Number}' data-order-Stump='${current.Key.Stump}' data-order-Type='${current.Key.Type}'>
			<a onclick=orderDetails("${current.Key.Number}","${current.Key.Stump}","${current.Key.Type}")>${current.InternalReference}</a></td>
			<td>${order_date}</td>
			<td>${storeName}</td>
			<td>
				$${current.TaxIncludedTotalAmount}
			</td>
		</tr>
		`
		$('#order-table-desktop').find('tbody').append(order);
		// set mobile order
		const orderMobile = `
		<ul class='order-list-mobile'>
			<li><div class="Text--subdued">Order</div> <span><a onclick=orderDetails("${current.Key.Number}","${current.Key.Stump}","${current.Key.Type}")>${current.InternalReference}</a></span></li>
			<li><div class="Text--subdued">DATE</div> <span>${order_date}</span></li>
			<li><div class="Text--subdued">STORE</div> <span>${storeName}</span></li>
			<li><div class="Text--subdued">TOTAL</div> <span>$${current.TaxIncludedTotalAmount}</span></li>
		</ul>
		<div class="account-divider"></div>
		`
		$('#order-card-mobile-offline').append(orderMobile);
		}

		
	}
}

function appendOrderDetails(n,o){
	const orderDateStr = o.Header.Date.split(' ')[0]
	const orderDateObj = new Date(orderDateStr)
	const orderDate = orderDateObj.toLocaleDateString('au')
	// order details pop up
	$('#order-details').html('')
	const orderDetails =`
	<ul class='order-details-wrapper'>
		<li><div>Order Number: ${o.Header.InternalReference}</div><div>Date: ${orderDate}</div></li>
	</ul>
	`
	$('#order-details').append(orderDetails);
	$('.order-details-wrapper').append(`<li class='order-details-items-container'>Items:</li>`)
	o.Lines.Get_Line.map(x=>{
		const lineItems=`
		<li class='order-details-items'><div>Product name: ${x.Label}</div><div>Product code: ${x.ItemCode}</div><div>Quantity: ${Math.abs(x.Quantity)}</div></li>
		`
		$('.order-details-wrapper').append(lineItems)
	})
	if (o.DeliveryAddress.email || o.Header.Origin=='ECommerce'){
		const DeliveryAddress = `
		<li class='order-details-address'>Delivery address:</li>
		<ul class='order-details-address-container'>
			<li><span>First Name:</span><span>${o.DeliveryAddress.FirstName || ''}</span></li>
			<li><span>Last Name:</span><span>${o.DeliveryAddress.LastName}</span></li>
			<li><span>Email:</span><span>${o.DeliveryAddress.Email}</span></li>
			<li><span>Phone:</span><span>${o.DeliveryAddress.Phone}</span></li>
			<li><span>Address Line 1:</span><span>${o.DeliveryAddress.Line1}</span></li>
			<li><span>City:</span><span>${o.DeliveryAddress.City}</span></li>
		</ul>
		`
		$('.order-details-wrapper').append(DeliveryAddress)
	}
	var paidAmount = 0
	o.Payments.Get_Payment.map(x=>{
		// const payments = `
		// <li class='order-details-payment'><div>Payment: ${Math.abs(x.Amount)} ${x.Currency}</div></li>`
		paidAmount += Number(x.Amount)
		
	})
	const payments = `
		<li class='order-details-payment'><div>Total: $${paidAmount.toFixed(2)}</div></li>`
	$('.order-details-wrapper').append(payments)
	const notice = '<li class="order-details-notice"><small>Please note this is not an invoice. If you require an invoice please email customercare@boardcollective.com.au</small></li>'
	$('.order-details-wrapper').append(notice)
	const html = $('#order-details').html()
	setTimeout(()=>{
		mrModelOnSwalContainer()
	},200)
	Swal.fire({
		title: "Order Details",
		html: html,
		showCloseButton: true,
		confirmButtonColor: 'black'
	}).then((result) => {
		if (result.isConfirmed) {
			mrModelClose()
		}})	
}

async function orderDetails(n,s,t){
	$(".mr-model-background").show()
	const oD = await getOrderDetailsY2({"Key":{"Number":n,"Stump":s,"Type":t}})
	appendOrderDetails(n,oD)
	console.log('order',oD)
	
}

function bindPaginationLink() {
	const page = Number(localStorage.getItem('y2_order_page'))
	const nextPage = localStorage.getItem('y2_order_has_next')
    $('#orders-custom-paginationPrev').on('click', e => {
        e.preventDefault();
        if (!$(e.currentTarget).hasClass('diabled-paginate')) {
            if (page != 1 && page) {
				console.log('?p')
                $('#order-table-desktop').find('tbody').empty();
                // $('#order-custom-details').empty();
                $('#order-y2-pagination').empty();
				localStorage.setItem('y2_order_page',page - 1)
                paginationOrderReqest(page - 1);
            }
        }
    })
    $('#orders-custom-paginationNext').on('click', e => {
        e.preventDefault();
        if (!$(e.currentTarget).hasClass('diabled-paginate')) {
			console.log(!$(e.currentTarget).hasClass('diabled-paginate')&& nextPage != 'false')			
			$('#order-table-desktop').find('tbody').empty();
			$('#order-custom-details').empty();
			$('#order-y2-pagination').empty();
			// set new page value 
			localStorage.setItem('y2_order_page',page + 1)
			paginationOrderReqest(page + 1);
            
        }
    })
}

function paginationOrderReqest(page){
	console.log(page)
	getJsonTokenUrl('order/customer',page).then(url => {
		$.get(url).then(res => {
			// append order list again
			appendOrderList(res)
			// valid if next page exist
			setHasNextPage(res)
			// set pagination if valid
			handlePagination()
			
		})
	})
}

function requestMetafield(target_url) {
	// console.log(target_url);
	$.get(target_url)
		.then(res => {
			console.log(res);
			const birthday = res.birthday
			const bp = res.brand_preferences
			if (bp){
				for (const eId of bp.split(',')){
					const bpId = '#account-brand-' + eId.toLowerCase()
					$(bpId).attr( "checked", true)
				}
			}
			$('.account-birthday').val(birthday)
			if (res.sms_consent){
				$('#account-communications-email').prop( "checked", true )
				$('#account-communications-sms').prop( "checked", true )
			}else if (res.email_consent) $('#account-communications-email').prop( "checked", true )
		})
}

if(window.location.pathname === '/account') {
	// my details
	$('#account-communications-email').on('click',(e)=>{
		if(!e.target.checked)$('#account-communications-sms').prop("checked",false)
	})
	$('#account-communications-sms').on('click',(e)=>{
		if(e.target.checked)$('#account-communications-email').prop("checked",true)
	})

	$('#account-details-save-btn').on('click',()=>{
		$('#account-details-save-btn').addClass('loading')
		$('#account-details-save-btn').text('')
		const birthday = $('.account-birthday').val()
		const brands = ['sw','sr','rh','bc'].filter(eId => $(`#account-brand-${eId}`).is(":checked"))
		payload = {
			"body":{
				"birthday": birthday,
				"brand_preferences": brands.join(',').toUpperCase(),
				"sms_consent": $('#account-communications-sms').prop('checked'),
				"email_consent": $('#account-communications-email').prop('checked'),
				"phone":  $('#account-form-phone').val()
			}
		}
		// const email = $('#account-form-email').val()
		// if (email)payload.body.email = email
		payload = JSON.stringify(payload)
		console.log(payload)
		getJsonTokenUrl().then(res=>{
			const settings = {
				"url": res,
				"method": "PUT",
				"headers": {
				  "Content-Type": "application/json"
				},
				"data": payload,
				success: function(data){
					console.log(data)
				},
				error: function(data){
					console.log('err',data)
				}
			  };
			$.ajax(settings).done(function () {
				$('#account-details-save-btn').removeClass('loading')
				$('#account-details-save-btn').text('SAVE')
				$('.mr-model-background').show()
				setTimeout(()=>{
					mrModelOnSwalContainer()
				},200)
				Swal.fire({
					title:'Thank you!',
					text:'Your details have been saved'
				}).then((result) => {
					if (result.isConfirmed) {
						mrModelClose()
					}})	
			  });
		})
		
	})
	mrModelBackground()
	// MY ORDERS
	$('.order-history-switch').on('click',function() { 
		const forAttr = $(this).attr('for');
		console.log(forAttr)
		if (forAttr == 'offline-order-history-switch'){
			$('.on-line-wrapper').hide()
			$('.off-line-wrapper').show()
		}else{
			$('.off-line-wrapper').hide()
			$('.on-line-wrapper').show()
		}
	});
}