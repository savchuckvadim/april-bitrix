// import React from 'react';
// import Info from '~/components/Info.vue'
// import Avatar from '~/components/Avatar.vue'
// import ProgressBar from '~/components/ProgressBar.vue'
// import Tabs from '~/components/Tabs.vue'
// import SpinnerIcon from '@bitrix24/b24icons-vue/specialized/SpinnerIcon'
// import Settings2Icon from '@bitrix24/b24icons-vue/actions/Settings2Icon'
// import UserGroupIcon from '@bitrix24/b24icons-vue/common-b24/UserGroupIcon'
// import EditIcon from '@bitrix24/b24icons-vue/button/EditIcon'
// import PlusIcon from '@bitrix24/b24icons-vue/button/PlusIcon'
// import FeedbackIcon from '@bitrix24/b24icons-vue/main/FeedbackIcon'
// import TrashBinIcon from "@bitrix24/b24icons-vue/main/TrashBinIcon"
// import Refresh7Icon from '@bitrix24/b24icons-vue/actions/Refresh7Icon'
// import CallChatIcon from '@bitrix24/b24icons-vue/main/CallChatIcon'
// import VideoAndChatIcon from '@bitrix24/b24icons-vue/main/VideoAndChatIcon'
// import TelephonyHandset6Icon from '@bitrix24/b24icons-vue/main/TelephonyHandset6Icon'
// import MessengerIcon from '@bitrix24/b24icons-vue/social/MessengerIcon'
// import DialogueIcon from '@bitrix24/b24icons-vue/crm/DialogueIcon'
// import PulseIcon from '@bitrix24/b24icons-vue/main/PulseIcon'
// const BXDialog = ({}) => {
//   return (
    

// 	<ClientOnly>
// 		<div class="mx-lg my-sm flex flex-col">
// 		<div class=""
// 		     :class="{
// 				'overflow-hidden': !isInit || isReload
// 			}"
// 		>
// 			<div
// 				v-if="!isInit || isReload || null === b24Helper"
// 				class="absolute top-0 bottom-0 left-0 right-0 flex flex-col justify-center items-center"
// 			>
// 				<div class="absolute z-10 text-info">
// 					<SpinnerIcon class="animate-spin stroke-2 size-44"/>
// 				</div>
// 			</div>
// 			<div v-else>
// 				<div class="flex items-center justify-start gap-4">
// 					<div class="flex items-center">
// 						<div
// 							class="px-lg2 py-sm2 border border-base-100 rounded-lg hover:shadow-md hover:-translate-y-px col-auto md:col-span-2 lg:col-span-1 bg-white cursor-pointer"
// 							@click.stop="makeOpenSliderForUser(b24Helper?.profileInfo.data.id || 0)"
// 						>
// 							<div class="flex items-center gap-4">
// 								<Avatar
// 									:src="b24Helper?.profileInfo.data.photo || ''"
// 									:alt="b24Helper?.profileInfo.data.lastName || 'user' "
// 								/>
// 								<div class="font-medium dark:text-white">
// 									<div class="text-nowrap text-xs text-base-500 dark:text-base-400">
// 										{{b24Helper?.hostName.replace('https://', '')}}
// 									</div>
// 									<div class="text-nowrap hover:underline hover:text-info-link">
// 										{{
// 											[
// 												b24Helper?.profileInfo.data.lastName,
// 												b24Helper?.profileInfo.data.name,
// 											].join(' ')
// 										}}
// 									</div>
// 									<div class="text-xs text-base-800 dark:text-base-400 flex flex-row gap-x-2">
// 										<span>{{b24Helper?.profileInfo.data.isAdmin ? 'Administrator' : ''}}</span>
// 										<span
// 											class="text-nowrap hover:underline hover:text-info-link"
// 											@click.stop="makeImOpenMessengerWithYourself()"
// 										>My notes</span>
// 									</div>
// 								</div>
// 							</div>
// 						</div>
// 					</div>
// 					<div class="w-0 flex-1">
// 						<Info>
// 							Scopes: <code>user_brief</code>, <code>crm</code>, <code>pull</code><br>
// 							To view query results, open the developer console.
// 						</Info>
// 					</div>
// 				</div>
// 				<div class="my-sm px-2 rounded-lg bg-white ">
// 					<Tabs
// 						:items="tabsItems"
// 						v-model="defTabIndex"
// 					>
// 						<template #item="{ item }">
// 							<div class="p-4">
// 								<div>
// 									<h3 class="text-h3 font-semibold leading-7 text-base-900">{{item.label}}</h3>
// 									<p class="mt-1 max-w-2xl text-sm leading-6 text-base-500">{{item.content}}</p>
// 								</div>
// 								<div class="mt-3 text-md text-base-900">
// 									<div v-if="item.key === 'lang'">
// 										<dl class="divide-y divide-base-100">
// 											<div class="px-2 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
// 												<dt class="text-sm font-medium leading-6">message 1</dt>
// 												<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 													{{t('message1')}}
// 												</dd>
// 											</div>
// 											<div class="px-2 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
// 												<dt class="text-sm font-medium leading-6">message 2</dt>
// 												<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 													{{t('message2')}}
// 												</dd>
// 											</div>
// 										</dl>
// 										<div
// 											class="pt-6"
// 											v-if="!isSliderMode"
// 										>
// 											<Info>Try changing the language at the bottom of the page</Info>
// 										</div>
// 										<div
// 											class="pt-6"
// 											v-else
// 										>
// 											<Info>The application is opened in slider mode</Info>
// 										</div>
// 									</div>
// 									<div v-else-if="item.key === 'appInfo'" class="space-y-3">
// 										<dl class="divide-y divide-base-100">
// 											<div class="px-2 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
// 												<dt class="text-sm font-medium leading-6">local identifier of the
// 													application on the account
// 												</dt>
// 												<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 													{{b24Helper?.appInfo.data.id}}
// 												</dd>
// 											</div>
// 											<div class="px-2 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
// 												<dt class="text-sm font-medium leading-6">application code</dt>
// 												<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 													{{b24Helper?.appInfo.data.code}}
// 												</dd>
// 											</div>
// 											<div class="px-2 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
// 												<dt class="text-sm font-medium leading-6">installed version of the
// 													application
// 												</dt>
// 												<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 													{{b24Helper?.appInfo.data.version}}
// 												</dd>
// 											</div>
// 											<div class="px-2 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
// 												<dt class="text-sm font-medium leading-6">status of the application</dt>
// 												<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 													{{b24Helper?.appInfo.statusCode}}
// 													[{{b24Helper?.appInfo.data.status}}]
// 												</dd>
// 											</div>
// 											<div class="px-2 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
// 												<dt class="text-sm font-medium leading-6">status of the application's
// 													installation
// 												</dt>
// 												<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 													{{b24Helper?.appInfo.data.isInstalled ? 'Y' : 'N'}}
// 												</dd>
// 											</div>
// 										</dl>
// 									</div>
// 									<div v-else-if="item.key === 'licenseInfo'" class="space-y-3">
// 										<dl class="divide-y divide-base-100">
// 											<div class="px-2 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
// 												<dt class="text-sm font-medium leading-6">language code designation</dt>
// 												<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 													{{b24Helper?.licenseInfo.data.languageId}}
// 												</dd>
// 											</div>
// 											<div class="px-2 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
// 												<dt class="text-sm font-medium leading-6">tariff designation with
// 													indication
// 													of the region as a
// 													prefix
// 												</dt>
// 												<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 													{{b24Helper?.licenseInfo.data.license}}
// 												</dd>
// 											</div>
// 											<div class="px-2 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
// 												<dt class="text-sm font-medium leading-6">internal tariff designation
// 													without indication of
// 													region
// 												</dt>
// 												<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 													{{b24Helper?.licenseInfo.data.licenseType}}
// 												</dd>
// 											</div>
// 											<div class="px-2 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
// 												<dt class="text-sm font-medium leading-6">past meaning of license</dt>
// 												<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 													{{b24Helper?.licenseInfo.data.licensePrevious}}
// 												</dd>
// 											</div>
// 											<div class="px-2 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
// 												<dt class="text-sm font-medium leading-6">tariff designation without
// 													specifying the region
// 												</dt>
// 												<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 													{{b24Helper?.licenseInfo.data.licenseFamily}}
// 												</dd>
// 											</div>
// 											<div class="px-2 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
// 												<dt class="text-sm font-medium leading-6">flag indicating whether it is
// 													a
// 													box or a cloud
// 												</dt>
// 												<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 													{{b24Helper?.licenseInfo.data.isSelfHosted ? 'Y' : 'N'}}
// 												</dd>
// 											</div>
// 											<div class="px-2 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
// 												<dt class="text-sm font-medium leading-6">flag indicating whether the
// 													paid
// 													period or trial period
// 													has expired
// 												</dt>
// 												<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 													{{b24Helper?.paymentInfo.data.isExpired ? 'Y' : 'N'}}
// 												</dd>
// 											</div>
// 											<div class="px-2 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
// 												<dt class="text-sm font-medium leading-6">number of days remaining until
// 													the
// 													end of the paid
// 													period or trial period
// 												</dt>
// 												<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 													{{b24Helper?.paymentInfo.data.days}}
// 												</dd>
// 											</div>
// 										</dl>
// 									</div>
// 									<div v-else-if="item.key === 'specific'" class="space-y-3">
// 										<dl class="divide-y divide-base-100">
// 											<div class="px-2 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
// 												<dt class="text-sm font-medium leading-6">flag indicating whether it is
// 													a
// 													box or a cloud
// 												</dt>
// 												<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 													{{b24Helper?.isSelfHosted ? 'Y' : 'N'}}
// 												</dd>
// 											</div>
// 											<div class="px-2 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
// 												<dt class="text-sm font-medium leading-6">the increment step of fields
// 													of
// 													type ID
// 												</dt>
// 												<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 													{{b24Helper?.primaryKeyIncrementValue}}
// 												</dd>
// 											</div>
// 											<div class="px-2 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
// 												<dt class="text-sm font-medium leading-6">specific URLs for a box or
// 													cloud
// 												</dt>
// 												<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 													<ul role="list" class="divide-y divide-base-100">
// 														<li class="flex items-center justify-start pb-4 pl-0 pr-5 text-sm leading-1">
// 															<div class="flex items-center">
// 																<div class="truncate font-medium">MainSettings</div>
// 															</div>
// 															<div class="ml-4 flex-shrink-0">
// 																<div
// 																	class="cursor-pointer underline hover:text-info-link"
// 																	@click.stop="makeOpenPage(b24Helper?.b24SpecificUrl.MainSettings)">
// 																	{{b24Helper?.b24SpecificUrl.MainSettings}}
// 																</div>
// 															</div>
// 														</li>
// 														<li class="flex items-center justify-start py-4 pl-0 pr-5 text-sm leading-1">
// 															<div class="flex items-center">
// 																<div class="truncate font-medium">UfList</div>
// 															</div>
// 															<div class="ml-4 flex-shrink-0">
// 																<div
// 																	class="cursor-pointer underline hover:text-info-link"
// 																	@click.stop="makeOpenUfList(b24Helper?.b24SpecificUrl.UfList)">
// 																	{{b24Helper?.b24SpecificUrl.UfList}}
// 																</div>
// 															</div>
// 														</li>
// 														<li class="flex items-center justify-start py-4 pl-0 pr-5 text-sm leading-1">
// 															<div class="flex items-center">
// 																<div class="truncate font-medium">UfPage</div>
// 															</div>
// 															<div class="ml-4 flex-shrink-0">
// 																{{b24Helper?.b24SpecificUrl.UfPage}}
// 															</div>
// 														</li>
// 													</ul>
// 												</dd>
// 											</div>
// 										</dl>
// 									</div>
// 									<div v-else-if="item.key === 'forB24Form'" class="space-y-3">
// 										<button
// 											type="button"
// 											class="flex relative flex-row flex-nowrap gap-1.5 justify-start items-center rounded-lg border border-base-100 bg-base-20 pl-2 pr-3 py-2 text-sm font-medium text-base-900 hover:shadow-md hover:-translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-base-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-base-200 disabled:shadow-none disabled:translate-y-0 disabled:text-base-900 disabled:opacity-75"
// 											@click="makeOpenFeedBack"
// 											:disabled="status.isProcess"
// 										>
// 											<div class="rounded-full text-base-900 bg-base-100 p-1">
// 												<FeedbackIcon class="size-5"/>
// 											</div>
// 											<div class="text-nowrap truncate">Feedback</div>
// 										</button>
// 										<dl class="divide-y divide-base-100">
// 											<div class="px-2 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
// 												<dt class="text-sm font-medium leading-6">app_code</dt>
// 												<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 													{{b24Helper?.forB24Form.app_code}}
// 												</dd>
// 											</div>
// 											<div class="px-2 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
// 												<dt class="text-sm font-medium leading-6">app_status</dt>
// 												<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 													{{b24Helper?.forB24Form.app_status}}
// 												</dd>
// 											</div>
// 											<div class="px-2 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
// 												<dt class="text-sm font-medium leading-6">payment_expired</dt>
// 												<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 													{{b24Helper?.forB24Form.payment_expired}}
// 												</dd>
// 											</div>
// 											<div class="px-2 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
// 												<dt class="text-sm font-medium leading-6">days</dt>
// 												<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 													{{b24Helper?.forB24Form.days}}
// 												</dd>
// 											</div>
// 											<div class="px-2 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
// 												<dt class="text-sm font-medium leading-6">b24_plan</dt>
// 												<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 													{{b24Helper?.forB24Form.b24_plan}}
// 												</dd>
// 											</div>
// 											<div class="px-2 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
// 												<dt class="text-sm font-medium leading-6">c_name</dt>
// 												<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 													{{b24Helper?.forB24Form.c_name}}
// 												</dd>
// 											</div>
// 											<div class="px-2 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
// 												<dt class="text-sm font-medium leading-6">c_last_name</dt>
// 												<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 													{{b24Helper?.forB24Form.c_last_name}}
// 												</dd>
// 											</div>
// 											<div class="px-2 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
// 												<dt class="text-sm font-medium leading-6">hostname</dt>
// 												<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 													{{b24Helper?.forB24Form.hostname}}
// 												</dd>
// 											</div>
// 										</dl>
// 									</div>
// 									<div v-else-if="item.key === 'currency'" class="space-y-3">
// 										<dl class="divide-y divide-base-100">
// 											<div class="px-2 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
// 												<dt class="pt-2 text-sm font-medium leading-6 flex flex-row gap-2 items-start justify-start">
// 													<button
// 														class="text-base-400 hover:text-base-master hover:bg-base-100 rounded"
// 														@click.stop="makeOpenSliderAddCurrency()"
// 													>
// 														<PlusIcon class="size-6"/>
// 													</button>
													
// 													<div class="flex-1">Symbolic Identifier of the Base Currency</div>
// 												</dt>
// 												<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 													<div
// 														class="text-sm font-medium flex flex-row gap-2 items-center justify-start">
// 														<div>
// 															<input
// 																type="number"
// 																v-model.number="valueForCurrency"
// 																class="border border-base-300 text-base-900 rounded block w-full p-2.5"
// 																step="101.023"
// 															>
// 														</div>
// 														<div class="flex-1">{{b24Helper?.currency.baseCurrency}}
// 														</div>
// 													</div>
// 												</dd>
// 											</div>
// 											<div
// 												v-for="(currencyCode) in b24Helper?.currency.currencyList"
// 												class="px-2 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0"
// 												:key="currencyCode"
// 											>
// 												<dt class="text-sm font-medium leading-6 flex flex-row gap-2 items-start justify-start">
// 													<button
// 														class="text-base-400 hover:text-base-master hover:bg-base-100 rounded"
// 														@click.stop="makeOpenSliderEditCurrency(currencyCode)"
// 													>
// 														<EditIcon class="size-6"/>
// 													</button>
// 													<div class="flex-1">{{currencyCode}}
// 														• <span
// 														v-html="b24Helper?.currency.getCurrencyFullName(currencyCode, b24CurrentLang)"></span>
// 														• <span v-html="b24Helper?.currency.getCurrencyLiteral(currencyCode)"></span>
// 													</div>
// 												</dt>
// 												<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 													<span
// 														v-html="b24Helper?.currency.format(valueForCurrency, currencyCode, b24CurrentLang)"></span>
// 												</dd>
// 											</div>
// 										</dl>
// 									</div>
// 									<div v-else-if="item.key === 'test'" class="space-y-3">
// 										<div class="mt-6 flex flex-col sm:flex-row gap-10">
// 											<div class="basis-1/6 flex flex-col gap-y-2">
// 												<button
// 													type="button"
// 													class="flex relative flex-row flex-nowrap gap-1.5 justify-start items-center rounded-lg border border-base-100 bg-base-20 pl-2 pr-3 py-2 text-sm font-medium text-base-900 hover:shadow-md hover:-translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-base-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-base-200 disabled:shadow-none disabled:translate-y-0 disabled:text-base-900 disabled:opacity-75"
// 													@click="makeSelectUsers"
// 													:disabled="status.isProcess"
// 												>
// 													<div class="rounded-full text-base-900 bg-base-100 p-1">
// 														<UserGroupIcon class="size-5"/>
// 													</div>
// 													<div class="text-nowrap truncate">Select Users</div>
// 												</button>
// 												<button
// 													type="button"
// 													class="flex relative flex-row flex-nowrap gap-1.5 justify-start items-center rounded-lg border border-base-100 bg-base-20 pl-2 pr-3 py-2 text-sm font-medium text-base-900 hover:shadow-md hover:-translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-base-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-base-200 disabled:shadow-none disabled:translate-y-0 disabled:text-base-900 disabled:opacity-75"
// 													@click="makeReloadWindow"
// 													:disabled="status.isProcess"
// 												>
// 													<div class="rounded-full text-base-900 bg-base-100 p-1">
// 														<Refresh7Icon class="size-5"/>
// 													</div>
// 													<div class="text-nowrap truncate">Reload Window</div>
// 												</button>
// 												<button
// 													type="button"
// 													class="flex relative flex-row flex-nowrap gap-1.5 justify-start items-center rounded-lg border border-base-100 bg-base-20 pl-2 pr-3 py-2 text-sm font-medium text-base-900 hover:shadow-md hover:-translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-base-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-base-200 disabled:shadow-none disabled:translate-y-0 disabled:text-base-900 disabled:opacity-75"
// 													@click="makeImCallTo(true)"
// 													:disabled="status.isProcess"
// 												>
// 													<div class="rounded-full text-base-900 bg-base-100 p-1">
// 														<VideoAndChatIcon class="size-5"/>
// 													</div>
// 													<div class="text-nowrap truncate">Video Call</div>
// 												</button>
// 												<button
// 													type="button"
// 													class="flex relative flex-row flex-nowrap gap-1.5 justify-start items-center rounded-lg border border-base-100 bg-base-20 pl-2 pr-3 py-2 text-sm font-medium text-base-900 hover:shadow-md hover:-translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-base-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-base-200 disabled:shadow-none disabled:translate-y-0 disabled:text-base-900 disabled:opacity-75"
// 													@click="makeImCallTo(false)"
// 													:disabled="status.isProcess"
// 												>
// 													<div class="rounded-full text-base-900 bg-base-100 p-1">
// 														<CallChatIcon class="size-5"/>
// 													</div>
// 													<div class="text-nowrap truncate">Voice Call</div>
// 												</button>
// 												<button
// 													type="button"
// 													class="flex relative flex-row flex-nowrap gap-1.5 justify-start items-center rounded-lg border border-base-100 bg-base-20 pl-2 pr-3 py-2 text-sm font-medium text-base-900 hover:shadow-md hover:-translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-base-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-base-200 disabled:shadow-none disabled:translate-y-0 disabled:text-base-900 disabled:opacity-75"
// 													@click="makeImOpenMessenger"
// 													:disabled="status.isProcess"
// 												>
// 													<div class="rounded-full text-base-900 bg-base-100 p-1">
// 														<MessengerIcon class="size-5"/>
// 													</div>
// 													<div class="text-nowrap truncate">Open Messenger</div>
// 												</button>
// 												<button
// 													type="button"
// 													class="flex relative flex-row flex-nowrap gap-1.5 justify-start items-center rounded-lg border border-base-100 bg-base-20 pl-2 pr-3 py-2 text-sm font-medium text-base-900 hover:shadow-md hover:-translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-base-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-base-200 disabled:shadow-none disabled:translate-y-0 disabled:text-base-900 disabled:opacity-75"
// 													@click="makeImOpenHistory"
// 													:disabled="status.isProcess"
// 												>
// 													<div class="rounded-full text-base-900 bg-base-100 p-1">
// 														<DialogueIcon class="size-5"/>
// 													</div>
// 													<div class="text-nowrap truncate">Open History</div>
// 												</button>
// 												<button
// 													type="button"
// 													class="flex relative flex-row flex-nowrap gap-1.5 justify-start items-center rounded-lg border border-base-100 bg-base-20 pl-2 pr-3 py-2 text-sm font-medium text-base-900 hover:shadow-md hover:-translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-base-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-base-200 disabled:shadow-none disabled:translate-y-0 disabled:text-base-900 disabled:opacity-75"
// 													@click="makeImPhoneTo"
// 													:disabled="status.isProcess"
// 												>
// 													<div class="rounded-full text-base-900 bg-base-100 p-1">
// 														<TelephonyHandset6Icon class="size-5"/>
// 													</div>
// 													<div class="text-nowrap truncate">Telephony</div>
// 												</button>
// 												<button
// 													type="button"
// 													class="flex relative flex-row flex-nowrap gap-1.5 justify-start items-center rounded-lg border border-base-100 bg-base-20 pl-2 pr-3 py-2 text-sm font-medium text-base-900 hover:shadow-md hover:-translate-y-px focus:outline-none focus-visible:ring-2 focus-visible:ring-base-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-base-200 disabled:shadow-none disabled:translate-y-0 disabled:text-base-900 disabled:opacity-75"
// 													@click="makeSendPullCommand('test', {data: Date.now()})"
// 													:disabled="status.isProcess"
// 												>
// 													<div class="rounded-full text-base-900 bg-base-100 p-1">
// 														<PulseIcon class="size-5"/>
// 													</div>
// 													<div class="text-nowrap truncate">Pull</div>
// 												</button>
// 											</div>
// 											<div class="flex-1">
// 												<div class="p-lg2 border border-base-100 rounded-md col-auto md:col-span-2 lg:col-span-1 bg-white">
// 													<div>
// 														<div class="w-full flex items-center justify-between">
// 															<h1 class="text-h1 font-semibold leading-7 text-base-900">{{status.title}}</h1>
// 															<button
// 																type="button"
// 																class="flex relative flex-row flex-nowrap gap-1.5 justify-center items-center uppercase rounded pl-1 pr-3 py-1.5 leading-none text-3xs font-medium text-base-700 hover:text-base-900 hover:bg-base-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-base-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-base-200 disabled:text-base-900 disabled:opacity-75"
// 																@click="clearConsole"
// 															>
// 																<TrashBinIcon class="size-4"/>
// 																<div class="text-nowrap truncate">Clear console</div>
// 															</button>
// 														</div>
// 														<div class="mt-2" v-show="status.messages.length > 0">
// 															<p class="max-w-2xl text-sm text-base-500" v-for="(message, index) in status.messages" :key="index">{{message}}</p>
// 														</div>
// 													</div>
// 													<div class="text-md text-base-900">
// 														<dl class="divide-y divide-base-100">
// 															<div class="mt-4 px-2 py-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0" v-show="null !== status.time.start">
// 																<dt class="text-sm font-medium leading-6">
// 																	start:
// 																</dt>
// 																<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 																	{{ (status.time?.start || DateTime.now()).setLocale(b24CurrentLang).toLocaleString(DateTime.TIME_24_WITH_SECONDS) }}
// 																</dd>
// 															</div>
// 															<div class="px-2 py-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0" v-show="null !== status.time.stop">
// 																<dt class="text-sm font-medium leading-6">
// 																	stop:
// 																</dt>
// 																<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 																	{{ (status.time?.stop || DateTime.now()).setLocale(b24CurrentLang).toLocaleString(DateTime.TIME_24_WITH_SECONDS) }}
// 																</dd>
// 															</div>
// 															<div class="px-2 py-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0" v-show="null !== status.time.interval">
// 																<dt class="text-sm font-medium leading-6">
// 																	interval:
// 																</dt>
// 																<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 																	{{ formatterNumber.format((status.time?.interval?.length() || 0) / 1_000) }} sec
// 																</dd>
// 															</div>
// 															<div class="px-2 py-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0" v-show="null !== status.resultInfo">
// 																<dt class="text-sm font-medium leading-6">
// 																	&nbsp;
// 																</dt>
// 																<dd class="mt-1 text-sm leading-6 text-base-700 sm:col-span-2 sm:mt-0">
// 																	{{status.resultInfo}}
// 																</dd>
// 															</div>
// 														</dl>
// 													</div>
// 													<div class="mt-4" v-show="status.isProcess">
// 														<div class="mb-2 text-4xs text-blue-500" v-show="status.processInfo">{{ status.processInfo }}</div>
// 														<ProgressBar
// 															:animation="status.progress.animation"
// 															:indicator="status.progress.indicator"
// 															:value="status.progress?.value || undefined"
// 															:max="status.progress?.max || 0"
// 														>
// 															<template
// 																v-if="status.progress.indicator"
// 																#indicator
// 															>
// 																<div class="text-right min-w-[60px] text-xs w-full">
// 																	<span class="text-blue-500">{{ status.progress.value }} / {{ status.progress.max }}</span>
// 																</div>
// 															</template>
// 														</ProgressBar>
// 													</div>
// 												</div>
// 												<div
// 													class="mt-6 text-alert-text px-lg2 py-sm2 border border-base-30 rounded-md shadow-sm hover:shadow-md sm:rounded-md col-auto md:col-span-2 lg:col-span-1 bg-white"
// 													v-if="!result.isSuccess"
// 												>
// 													<div>
// 														<div class="mb-2 w-full flex items-center justify-between">
// 															<h1 class="text-h1 font-semibold leading-7 text-base-900">Error</h1>
// 														</div>
// 														<p class="max-w-2xl text-txt-md" v-for="(problem, indexProblem) in problemMessageList(result)" :key="indexProblem">{{problem}}</p>
// 													</div>
// 												</div>
// 												<div class="overflow-hidden mt-4 px-lg2 py-sm2 border border-base-30 rounded-md shadow-sm hover:shadow-md sm:rounded-md col-auto md:col-span-2 lg:col-span-1 bg-white">
// 													<div class="w-full flex items-center justify-between mb-4">
// 														<h3 class="text-h5 font-semibold">App.Options</h3>
// 														<button
// 															type="button"
// 															class="flex relative flex-row flex-nowrap gap-1.5 justify-center items-center uppercase rounded pl-1 pr-3 py-1.5 leading-none text-3xs font-medium text-base-700 hover:text-base-900 hover:bg-base-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-base-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-base-200 disabled:text-base-900 disabled:opacity-75"
// 															@click="makeOpenAppOptions()"
// 															:disabled="status.isProcess"
// 														>
// 															<Settings2Icon class="size-4"/>
// 															<div class="text-nowrap truncate">App Options</div>
// 														</button>
// 													</div>
// 													<pre class="mb-4">{{
// 														b24Helper?.appOptions.data
// 													}}</pre>
// 												</div>
// 												<div class="overflow-hidden  mt-4 px-lg2 py-sm2 border border-base-30 rounded-md shadow-sm hover:shadow-md sm:rounded-md col-auto md:col-span-2 lg:col-span-1 bg-white">
// 													<div class="w-full flex items-center justify-between mb-4">
// 														<h3 class="text-h5 font-semibold">User.Options</h3>
// 														<button
// 															type="button"
// 															class="flex relative flex-row flex-nowrap gap-1.5 justify-center items-center uppercase rounded pl-1 pr-3 py-1.5 leading-none text-3xs font-medium text-base-700 hover:text-base-900 hover:bg-base-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-base-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-base-200 disabled:text-base-900 disabled:opacity-75"
// 															@click="makeOpenUserOptions()"
// 															:disabled="status.isProcess"
// 														>
// 															<Settings2Icon class="size-4"/>
// 															<div class="text-nowrap truncate">User Options</div>
// 														</button>
// 													</div>
// 													<h3 class="text-h5 font-semibold mb-4">.Options</h3>
// 													<pre class="mb-4">{{
// 														b24Helper?.userOptions.data
// 													}}</pre>
// 												</div>
// 											</div>
// 										</div>
// 									</div>
// 								</div>
// 							</div>
// 						</template>
// 					</Tabs>
// 				</div>
// 			</div>
// 		</div>
// 		</div>
// 	</ClientOnly>

//   );
// }

// export default BXDialog;