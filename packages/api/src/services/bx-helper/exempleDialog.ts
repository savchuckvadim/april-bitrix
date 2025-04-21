
// import { ref, type Ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
// import { DateTime, Interval } from 'luxon'
// import {
// 	LoggerBrowser,
// 	Result,
// 	B24LangList,
// 	B24Frame,
// 	useB24Helper,
// 	LoadDataType,
// 	useFormatter
// } from '@bitrix24/b24jssdk'
// import type {
// 	IResult,
// 	SelectedUser,
// 	TypePullMessage,
// 	StatusClose
// } from '@bitrix24/b24jssdk'


// // import { useI18n } from '#imports'

// // definePageMeta({
// // 	layout: 'page',
// // 	title: 'Playground'
// // })

// // region Init ////
// const $logger = LoggerBrowser.build(
// 	'Demo: Frame',
// 	true
// )

// let $b24: B24Frame
// const isInit: Ref<boolean> = ref(false)
// const isReload: Ref<boolean> = ref(false)
// let result: IResult = new Result()
// const { formatterNumber } = useFormatter()
// const {
// 	initB24Helper,
// 	destroyB24Helper,
// 	getB24Helper,
// 	usePullClient,
// 	useSubscribePullClient,
// 	startPullClient
// } = useB24Helper()
// const $isInitB24Helper = ref(false)
// // const {t, locales, setLocale} = useI18n()
// const b24CurrentLang: Ref<string> = ref(B24LangList.en)

// const defTabIndex = ref(0)
// const valueForCurrency = ref(123456.789)
// const tabsItems = [
// 	{
// 		key: 'test',
// 		label: 'Test',
// 		content: 'Testing specific methods'
// 	},
// 	{
// 		key: 'lang',
// 		label: 'I18n',
// 		content: 'Demonstrates the output of language messages depending on the locale of Bitrix24'
// 	},
// 	{
// 		key: 'appInfo',
// 		label: 'App',
// 		content: 'Information about the application'
// 	},
// 	{
// 		key: 'licenseInfo',
// 		label: 'License & Payment',
// 		content: 'Designation of the plan with the region indicated as a prefix'
// 	},
// 	{
// 		key: 'specific',
// 		label: 'Specific',
// 		content: 'List of specific parameters for box and cloud'
// 	},
// 	{
// 		key: 'forB24Form',
// 		label: 'Form Fields',
// 		content: 'Examples of fields for the feedback form'
// 	},
// 	{
// 		key: 'currency',
// 		label: 'Currency',
// 		content: 'List of currencies created in Bitrix24'
// 	}
// ]

// interface IStatus
// {
// 	isProcess: boolean,
// 	title: string,
// 	messages: string[],
// 	processInfo: null|string,
// 	resultInfo: null|string,
// 	progress: {
// 		animation: boolean,
// 		indicator: boolean,
// 		value: null|number,
// 		max: null|number
// 	},
// 	time: {
// 		start: null|DateTime,
// 		stop: null|DateTime,
// 		interval: null|Interval
// 	}
// }

// const status: Ref<IStatus> = ref({
// 	isProcess: false,
// 	title: 'Specify what we will test',
// 	messages: [],
// 	processInfo: null,
// 	resultInfo: null,
// 	progress: {
// 		animation: false,
// 		indicator: true,
// 		value: 0,
// 		max: 0
// 	},
// 	time: {
// 		start: null,
// 		stop: null,
// 		interval: null,
// 	}
// } as IStatus)

// // onMounted(async() =>
// // {
// // 	try
// // 	{
// // 		const { $initializeB24Frame } = useNuxtApp()
// // 		$b24 = await $initializeB24Frame()
// // 		$b24.setLogger(LoggerBrowser.build('Core', true))
// // 		b24CurrentLang.value = $b24.getLang()
// // 		formatterNumber.setDefLocale($b24.getLang())
		
// // 		if(locales.value.filter(i => i.code === b24CurrentLang.value).length > 0)
// // 		{
// // 			setLocale(b24CurrentLang.value)
// // 			$logger.log('setLocale >>>', b24CurrentLang.value)
// // 		}
// // 		else
// // 		{
// // 			$logger.warn('not support locale >>>', b24CurrentLang.value)
// // 		}
		
// // 		await $b24.parent.setTitle('[playgrounds] Testing Frame')
		
// // 		await initB24Helper(
// // 			$b24,
// // 			[
// // 				LoadDataType.Profile,
// // 				LoadDataType.App,
// // 				LoadDataType.Currency,
// // 				LoadDataType.AppOptions,
// // 				LoadDataType.UserOptions,
// // 			]
// // 		)
// // 		$isInitB24Helper.value = true
		
// // 		usePullClient()
// // 		useSubscribePullClient(
// // 			makeSendPullCommandHandler.bind(this),
// // 			'main'
// // 		)
// // 		startPullClient()
		
// // 		isInit.value = true
// // 		isReload.value = false
		
// // 		await makeFitWindow()
// // 	}
// // 	catch(error: any)
// // 	{
// // 		$logger.error(error)
// // 		showError({
// // 			statusCode: 404,
// // 			statusMessage: error?.message || error,
// // 			data: {
// // 				description: 'Problem in app',
// // 				homePageIsHide: true,
// // 				isShowClearError: true,
// // 				clearErrorHref: '/'
// // 			},
// // 			cause: error,
// // 			fatal: true
// // 		})
// // 	}
// // })

// // onUnmounted(() =>
// // {
// // 	$b24?.destroy()
// // 	destroyB24Helper()
// // })

// const b24Helper = computed(() => {
// 	if($isInitB24Helper.value)
// 	{
// 		return getB24Helper()
// 	}
	
// 	return null
// })
// // endregion ////

// // region Actions ////
// const reloadData = async(): Promise<void> =>
// {
// 	isReload.value = true
// 	return getB24Helper()
// 	.loadData([
// 		LoadDataType.Profile,
// 		LoadDataType.App,
// 		LoadDataType.Currency,
// 		LoadDataType.AppOptions,
// 		LoadDataType.UserOptions,
// 	])
// 	.then(() => {
// 		isReload.value = false
		
// 		return makeFitWindow()
// 	})
// }

// const isSliderMode = computed((): boolean =>
// {
// 	if(!isInit.value)
// 	{
// 		return false
// 	}
	
// 	return $b24?.placement.isSliderMode
// })

// const makeFitWindow = async() =>
// {
// 	window.setTimeout(() =>
// 	{
// 		// $b24.parent.fitWindow() ////
// 		$b24.parent.resizeWindowAuto()
// 	}, 200)
// }

// const stopMakeProcess = () =>
// {
	
// 	status.value.time.stop = DateTime.now()
	
// 	if(
// 		status.value.time.stop
// 		&& status.value.time.start
// 	)
// 	{
// 		status.value.time.interval = Interval.fromDateTimes(
// 			status.value.time.start,
// 			status.value.time.stop,
// 		)
// 	}
// 	status.value.processInfo = null
	
// 	makeFitWindow()
// 	.then(() => {
// 		status.value.isProcess = false
// 	})
// }

// const clearConsole = () =>
// {
// 	console.clear()
// }

// const reInitStatus = () =>
// {
// 	result = new Result()
	
// 	status.value.isProcess = false
// 	status.value.title = 'Specify what we will test'
// 	status.value.messages = []
// 	status.value.processInfo = null
// 	status.value.resultInfo = null
// 	status.value.progress.animation = false
// 	status.value.progress.indicator = true
// 	status.value.progress.value = 0
// 	status.value.progress.max = 0
// 	status.value.time.start = null
// 	status.value.time.stop = null
// 	status.value.time.interval = null
// }

// const makeReloadWindow = async() =>
// {
// 	reInitStatus()
// 	status.value.isProcess = true
// 	status.value.title = 'test makeReloadWindow'
// 	status.value.progress.animation = true
// 	status.value.progress.indicator = false
// 	status.value.progress.value = null
	
// 	return $b24.parent.reloadWindow()
// 		.catch((error: Error|string) =>
// 		{
// 			result.addError(error);
// 			$logger.error(error);
// 		})
// }

// const makeOpenAppOptions = async() =>
// {
// 	return $b24.slider.openSliderAppPage(
// 		{
// 			place: 'app.options',
// 			bx24_width: 650,
// 			bx24_label: {
// 				bgColor: 'violet',
// 				text: '🛠️',
// 				color: '#ffffff',
// 			},
// 			bx24_title: 'App Options',
// 		}
// 	)
// }

// const makeOpenUserOptions = async() =>
// {
// 	return $b24.slider.openSliderAppPage(
// 		{
// 			place: 'user.options',
// 			bx24_width: 650,
// 			bx24_label: {
// 				bgColor: 'aqua',
// 				text: '🔨',
// 				color: '#ffffff',
// 			},
// 			bx24_title: 'User Options',
// 		}
// 	)
// }

// const makeOpenFeedBack = async() =>
// {
// 	return $b24.slider.openSliderAppPage(
// 		{
// 			place: 'feedback',
// 			bx24_width: 650,
// 			bx24_label: {
// 				bgColor: 'green',
// 				text: 'Feedback',
// 				color: '#ffffff',
// 			},
// 			bx24_title: 'Feedback',
// 		}
// 	)
// }

// const makeOpenSliderForUser = async(userId: number) =>
// {
// 	return $b24.slider.openPath(
// 		$b24.slider.getUrl(`/company/personal/user/${userId}/`),
// 		950
// 	)
// 		.then((response: StatusClose) =>
// 		{
			
// 			$logger.warn(response)
			
// 			if(
// 				!response.isOpenAtNewWindow
// 				&& response.isClose
// 			)
// 			{
// 				$logger.info("Slider is closed! Reinit the application")
// 				return reloadData()
// 			}
// 		})
// }

// const makeOpenSliderEditCurrency = async(currencyCode: string) =>
// {
// 	return $b24.slider.openPath(
// 		$b24.slider.getUrl(`/crm/configs/currency/edit/${currencyCode}/`),
// 		950
// 	)
// 		.then((response: StatusClose) =>
// 		{
// 			$logger.warn(response)
// 			if(
// 				!response.isOpenAtNewWindow
// 				&& response.isClose
// 			)
// 			{
// 				$logger.info("Slider is closed! Reinit the application")
// 				return reloadData()
// 			}
// 		})
// }

// const makeOpenSliderAddCurrency = async() =>
// {
// 	return $b24.slider.openPath(
// 		$b24.slider.getUrl(`/crm/configs/currency/add/`),
// 		950
// 	)
// 		.then((response: StatusClose) =>
// 		{
// 			$logger.warn(response)
// 			if(
// 				!response.isOpenAtNewWindow
// 				&& response.isClose
// 			)
// 			{
// 				$logger.info("Slider is closed! Reinit the application")
// 				return reloadData()
// 			}
// 		})
// }

// const makeOpenPage = async(url: string) =>
// {
// 	return $b24.slider.openPath(
// 		$b24.slider.getUrl(url),
// 		950
// 	)
// }

// const makeOpenUfList = async(url: string) =>
// {
// 	const path = $b24.slider.getUrl(url)
// 	path.searchParams.set('moduleId', 'crm')
// 	path.searchParams.set('entityId', 'CRM_DEAL')
	
// 	return $b24.slider.openPath(
// 		path,
// 		950
// 	)
// }

// const makeImCallTo = async(isVideo: boolean = true) =>
// {
// 	return new Promise((resolve) =>
// 	{
// 		reInitStatus()
// 		status.value.isProcess = true
// 		status.value.title = 'test imCallTo'
		
// 		status.value.progress.animation = true
// 		status.value.progress.indicator = false
// 		status.value.progress.value = null
// 		status.value.time.start = DateTime.now()
		
// 		return resolve(null)
// 	})
// 	.then(async() =>
// 	{
// 		status.value.messages.push('use $b24.dialog.selectUser to select a user')
		
// 		const selectedUser = await $b24.dialog.selectUser()
		
// 		$logger.info(selectedUser)
		
// 		if(selectedUser)
// 		{
// 			if(Number(selectedUser.id) === (b24Helper.value?.profileInfo.data.id || 0))
// 			{
// 				return Promise.reject(new Error('You can\'t make a call to yourself'))
// 			}
// 			status.value.messages.push('use $b24.parent.imCallTo to initiate a call via intercom')
// 			return $b24.parent.imCallTo(
// 				Number(selectedUser.id),
// 				isVideo
// 			)
// 		}
		
// 		return Promise.reject(new Error('User not selected'))
// 	})
// 	.catch((error: Error|string) =>
// 	{
// 		result.addError(error)
// 		$logger.error(error)
// 	})
// 	.finally(() =>
// 	{
// 		stopMakeProcess()
// 	})
// }

// const makeImPhoneTo = async() =>
// {
// 	return new Promise((resolve) =>
// 	{
// 		reInitStatus()
// 		status.value.isProcess = true
// 		status.value.title = 'test ImPhoneTo'
// 		status.value.messages.push('use $b24.parent.imPhoneTo to make call')
		
// 		status.value.progress.animation = true
// 		status.value.progress.indicator = false
// 		status.value.progress.value = null
// 		status.value.time.start = DateTime.now()
		
// 		return resolve(null)
// 	})
// 		.then(async() =>
// 		{
			
// 			const promptPhone = prompt(
// 				'Please provide phone'
// 			)
			
// 			if(null === promptPhone)
// 			{
// 				return Promise.resolve()
// 			}
			
// 			const phone = String(promptPhone)
			
// 			if(phone.length < 1)
// 			{
// 				return Promise.reject(new Error('Empty phone number'))
// 			}
			
// 			return $b24.parent.imPhoneTo(
// 				phone
// 			)
// 		})
// 		.catch((error: Error|string) =>
// 		{
// 			result.addError(error)
// 			$logger.error(error)
// 		})
// 		.finally(() =>
// 		{
// 			stopMakeProcess()
// 		})
// }

// const makeImOpenMessenger = async() =>
// {
// 	return new Promise((resolve) =>
// 	{
// 		reInitStatus()
// 		status.value.isProcess = true
// 		status.value.title = 'test imOpenMessenger'
// 		status.value.messages.push('use $b24.parent.imOpenMessenger to open a chat window')
// 		status.value.progress.animation = true
// 		status.value.progress.indicator = false
// 		status.value.progress.value = null
// 		status.value.time.start = DateTime.now()
		
// 		return resolve(null)
// 	})
// 		.then(async() =>
// 		{
// 			const promptDialogId = prompt(
// 				'Please provide dialogId (number|`chat${number}`|`sg${number}`|`imol|${number}`|undefined)'
// 			)
			
// 			if(null === promptDialogId)
// 			{
// 				return Promise.resolve()
// 			}
			
// 			let dialogId: any = String(promptDialogId)
			
// 			if(dialogId.length < 1)
// 			{
// 				dialogId = undefined
// 			}
// 			else if(
// 				!dialogId.startsWith('chat')
// 				&& !dialogId.startsWith('imol')
// 				&& !dialogId.startsWith('sg')
// 			)
// 			{
// 				dialogId = Number(dialogId)
// 			}
			
// 			return $b24.parent.imOpenMessenger(
// 				dialogId
// 			)
// 		})
// 		.catch((error: Error|string) =>
// 		{
// 			result.addError(error)
// 			$logger.error(error)
// 		})
// 		.finally(() =>
// 		{
// 			stopMakeProcess()
// 		})
// }

// const makeImOpenMessengerWithYourself = async() =>
// {
// 	return new Promise((resolve) =>
// 	{
// 		reInitStatus()
// 		status.value.isProcess = true
// 		status.value.title = 'test imOpenMessenger'
// 		status.value.messages.push('use $b24.parent.imOpenMessenger to open a chat window with yourself')
// 		status.value.progress.animation = true
// 		status.value.progress.indicator = false
// 		status.value.progress.value = null
// 		status.value.time.start = DateTime.now()
		
// 		return resolve(null)
// 	})
// 		.then(async() =>
// 		{
// 			return $b24.parent.imOpenMessenger(
// 				(b24Helper.value?.profileInfo.data.id || 0)
// 			)
// 		})
// 		.catch((error: Error|string) =>
// 		{
// 			result.addError(error)
// 			$logger.error(error)
// 		})
// 		.finally(() =>
// 		{
// 			stopMakeProcess()
// 		})
// }

// const makeImOpenHistory = async() =>
// {
// 	const promptDialogId = prompt(
// 		'Please provide dialogId (number|`chat${number}`|`imol|${number})'
// 	)
	
// 	if(null === promptDialogId)
// 	{
// 		return Promise.resolve()
// 	}
	
// 	let dialogId: any = String(promptDialogId)
	
// 	if(
// 		!dialogId.startsWith('chat')
// 		&& !dialogId.startsWith('imol')
// 	)
// 	{
// 		dialogId = Number(dialogId)
// 	}
	
// 	
// 	return $b24.parent.imOpenHistory(
// 		dialogId
// 	)
// }

// const makeSelectUsers = async() =>
// {
// 	return new Promise((resolve) =>
// 	{
// 		reInitStatus()
// 		status.value.isProcess = true
// 		status.value.title = 'test $b24.dialog.selectUsers'
// 		status.value.messages.push('use $b24.dialog.selectUsers to select a user')
		
// 		status.value.progress.animation = true
// 		status.value.progress.indicator = false
// 		status.value.progress.value = null
// 		status.value.time.start = DateTime.now()
		
// 		return resolve(null)
// 	})
// 	.then(async() =>
// 	{
// 		const selectedUsers = await $b24.dialog.selectUsers()
		
// 		$logger.info(selectedUsers)
		
// 		const list = selectedUsers.map((row: SelectedUser): string =>
// 		{
// 			return [
// 				`[id: ${row.id}]`,
// 				row.name,
// 			].join(' ')
// 		})
		
// 		if(list.length < 1)
// 		{
// 			list.push('~ empty ~')
// 		}
		
// 		status.value.resultInfo = `list: ${list.join('; ')}`
// 	})
// 	.catch((error: Error|string) =>
// 	{
// 		result.addError(error)
// 		$logger.error(error)
// 	})
// 	.finally(() =>
// 	{
// 		stopMakeProcess()
// 	})
// }
// // endregion ////

// // region Actions.Pull ////
// const makeSendPullCommand = async(
// 	command: string,
// 	params: Record<string, any> = {}
// ) =>
// {
// 	return new Promise((resolve) =>
// 	{
// 		reInitStatus()
// 		status.value.isProcess = true
// 		status.value.title = 'test pull.application.event.add'
// 		status.value.messages.push('use $b24.dialog.selectUsers to select a user')
// 		status.value.messages.push('use pull.application.event.add for send event')
		
// 		status.value.progress.animation = true
// 		status.value.progress.indicator = false
// 		status.value.progress.value = null
// 		return resolve(null)
// 	})
// 	.then(async() =>
// 	{
// 		const selectedUsers = await $b24.dialog.selectUsers()
// 		const list = selectedUsers.map((row: SelectedUser): string =>
// 		{
// 			return [
// 				`[id: ${row.id}]`,
// 				row.name,
// 			].join(' ')
// 		})
		
// 		if(list.length < 1)
// 		{
// 			list.push('~ empty ~')
// 		}
		
// 		params.userList = list
		
// 		$logger.warn('>> pull.send >>>', params)
		
// 		status.value.time.start = DateTime.now()
		
// 		return $b24.callMethod(
// 			'pull.application.event.add',
// 			{
// 				COMMAND: command,
// 				PARAMS: params,
// 				MODULE_ID: b24Helper.value?.getModuleIdPullClient()
// 			}
// 		)
// 	})
// 	.catch((error: Error|string) =>
// 	{
// 		result.addError(error)
// 		$logger.error(error)
// 	})
// 	.finally(() =>
// 	{
// 		stopMakeProcess()
// 	})
// }

// const makeSendPullCommandHandler = (message: TypePullMessage): void =>
// {
// 	$logger.warn('<< pull.get <<<', message)
	
// 	if(message.command === 'reload.options')
// 	{
// 		$logger.info("Get pull command for update. Reinit the application")
// 		reloadData()
// 		return
// 	}
	
// 	status.value.resultInfo = `command: ${message.command}; params: ${JSON.stringify(message.params)}`
// 	stopMakeProcess()
	
// }
// // endregion ////

// // region Error ////
// const problemMessageList = (result: IResult) =>
// {
// 	let problemMessageList: string[] = [];
// 	const problem = result.getErrorMessages();
// 	if(typeof (problem || '') === 'string')
// 	{
// 		problemMessageList.push(problem.toString());
// 	}
// 	else if(Array.isArray(problem))
// 	{
// 		problemMessageList = problemMessageList.concat(problem);
// 	}
	
// 	return problemMessageList;
// }
// // endregion ////

// watch(defTabIndex, async() =>
// {
// 	await nextTick()
	
// 	await $b24.parent.fitWindow()
// })

